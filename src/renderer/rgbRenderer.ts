export async function rgbRenderer(canvas: HTMLCanvasElement) {
  if (!navigator.gpu) throw new Error("WebGPU not supported");

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No GPU adapter found");
  const device = await adapter.requestDevice();
  device.addEventListener("uncapturederror", (ev) =>
    console.warn(ev.error.message),
  );

  const context = canvas.getContext("webgpu") as GPUCanvasContext;

  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({ device, format, alphaMode: "premultiplied" });

  const vertexData = new Float32Array([
    -1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1,
  ]);

  const vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(vertexBuffer.getMappedRange()).set(vertexData);
  vertexBuffer.unmap();

  const shaderModule = device.createShaderModule({
    code: `
    struct SizeUniform {
        width: f32,
        height: f32,
    };
    @group(0) @binding(0) var<uniform> u_size: SizeUniform;
    @group(1) @binding(0) var<uniform> u_luminance: f32;


    @vertex
    fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
      return vec4<f32>(position, 0.0, 1.0);
    }
  
    @fragment
    fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
      let x = pos.x / u_size.width;
      let y = pos.y / u_size.height;
      let r = x;
      let g = y;
      let b = 1.0 - max(x, y);
      let lum = u_luminance;
      return vec4<f32>(r * lum, g * lum, b * lum, 1.0);
    }

    `,
  });

  const sizeBuffer = device.createBuffer({
    size: 8,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(
    sizeBuffer,
    0,
    new Float32Array([canvas.width, canvas.height]),
  );
  const sizeBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });
  const sizeBindGroup = device.createBindGroup({
    layout: sizeBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: sizeBuffer },
      },
    ],
  });

  const luminanceBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const luminanceBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });
  const luminanceBindGroup = device.createBindGroup({
    layout: luminanceBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: luminanceBuffer },
      },
    ],
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [sizeBindGroupLayout, luminanceBindGroupLayout],
    }),
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 8,

          attributes: [{ shaderLocation: 0, format: "float32x2", offset: 0 }],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  function sync(luminance: number) {
    device.queue.writeBuffer(luminanceBuffer, 0, new Float32Array([luminance]));
  }
  sync(0);

  function render() {
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,

          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setBindGroup(0, sizeBindGroup);
    renderPass.setBindGroup(1, luminanceBindGroup);
    renderPass.draw(6);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  return {
    render,
    sync,
  };
}
