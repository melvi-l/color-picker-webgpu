export async function hslRenderer(canvas: HTMLCanvasElement) {
  if (!navigator.gpu) throw new Error("WebGPU not supported");

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No GPU adapter found");
  const device = await adapter.requestDevice();
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
    @group(1) @binding(0) var<uniform> u_hue: f32;

    @vertex
    fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
      var pos = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
        vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
      );
      return vec4<f32>(pos[idx], 0.0, 1.0);
    }

    fn hsl2rgb(h: f32, s: f32, l: f32) -> vec3<f32> {
      let c = (1.0 - abs(2.0 * l - 1.0)) * s;
      let hPrime = h * 6.0;
      let x = c * (1.0 - abs(hPrime % 2.0 - 1.0));
      var r = 0.0;

      var g = 0.0;
      var b = 0.0;

      if (hPrime < 1.0) { r = c; g = x; }

      else if (hPrime < 2.0) { r = x; g = c; }
      else if (hPrime < 3.0) { g = c; b = x; }
      else if (hPrime < 4.0) { g = x; b = c; }
      else if (hPrime < 5.0) { r = x; b = c; }
      else { r = c; b = x; }

      let m = l - c / 2.0;
      return vec3<f32>(r + m, g + m, b + m);
    }

    @fragment
    fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
      let s = pos.x / u_size.width;
      let t = pos.y / u_size.height;

      let lTop = (1.0 - s) * 1.0 + s * 0.5;
      let l = (1.0 - t) * lTop;

      let rgb = hsl2rgb(u_hue, s, l);
      return vec4<f32>(rgb, 1.0);
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

  const hueBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const hueBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });
  const hueBindGroup = device.createBindGroup({
    layout: hueBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: hueBuffer },
      },
    ],
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [sizeBindGroupLayout, hueBindGroupLayout],
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

  function sync(hue: number) {
    device.queue.writeBuffer(hueBuffer, 0, new Float32Array([hue]));
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
    renderPass.setBindGroup(1, hueBindGroup);
    renderPass.draw(6);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  return { sync, render };
}
