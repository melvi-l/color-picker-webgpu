export function Interactor(
  element: HTMLElement,
  onChange: (color: { x: number; y: number }) => void,
  options?: { onlyInside?: boolean },
) {
  const { onlyInside = false } = options ?? {};

  let isPressing = false;

  const pointerDown = (e: MouseEvent) => {
    isPressing = true;
    disableTextSelection();

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onChange(clamp(x, y));
  };
  const pointerMove = (e: MouseEvent) => {
    if (!isPressing) return;

    e.preventDefault();

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onChange(clamp(x, y));
  };
  const cancel = () => {
    isPressing = false;
    enableTextSelection();
  };

  element.addEventListener("pointerdown", pointerDown);
  if (onlyInside) {
    element.addEventListener("pointermove", pointerMove);
    element.addEventListener("pointerup", cancel);
    element.addEventListener("pointerleave", cancel);
  } else {
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", cancel);
  }
  element.addEventListener("pointercancel", cancel);

  return () => {
    element.removeEventListener("pointerdown", pointerDown);
    if (onlyInside) {
      element.removeEventListener("pointermove", pointerMove);
      element.removeEventListener("pointerup", cancel);
      element.removeEventListener("pointerleave", cancel);
    } else {
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", cancel);
    }
    element.removeEventListener("pointercancel", cancel);
  };

  function clamp(_x: number, _y: number) {
    const x = Math.max(0, Math.min(_x, element.offsetWidth));
    const y = Math.max(0, Math.min(_y, element.offsetWidth));
    return { x, y };
  }
}

function disableTextSelection() {
  document.body.style.userSelect = "none";
}

function enableTextSelection() {
  document.body.style.userSelect = "";
}
