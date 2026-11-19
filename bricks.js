(() => {
  "use strict";

  const canvas = document.querySelector(".brick-ripple");
  const context = canvas.getContext("2d");
  if (!context || typeof context.roundRect !== "function") return;

  const enabled = matchMedia("(any-pointer: fine) and (any-hover: hover) and (prefers-reduced-motion: no-preference)");
  const columnWidth = 17;
  const rowHeight = 28;
  const radius = 86;
  const bricks = new Map();
  let pointer;
  let frame = 0;
  let lastTime = 0;

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    pointer = null;
    bricks.clear();
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  function resize() {
    reset();
    if (!enabled.matches) return;

    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * scale);
    canvas.height = Math.round(canvas.clientHeight * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function liftNearbyBricks() {
    const { x, y } = pointer;
    const firstRow = Math.floor((y - radius) / rowHeight);
    const lastRow = Math.floor((y + radius) / rowHeight);
    for (let row = firstRow; row <= lastRow; row++) {
      const offset = (row % 2) * columnWidth / 2;
      const firstColumn = Math.floor((x - radius - offset) / columnWidth);
      const lastColumn = Math.floor((x + radius - offset) / columnWidth);
      for (let column = firstColumn; column <= lastColumn; column++) {
        const centerX = (column + 0.5) * columnWidth + offset;
        const centerY = (row + 0.5) * rowHeight;
        const proximity = 1 - Math.hypot(centerX - x, centerY - y) / radius;
        if (proximity <= 0) continue;

        const key = `${column},${row}`;
        let brick = bricks.get(key);
        if (!brick) {
          brick = { x: centerX, y: centerY, height: 19 + Math.abs((column + row * 3) % 5), lift: 0, target: 0 };
          bricks.set(key, brick);
        }
        brick.target = proximity ** 1.35;
      }
    }
  }

  function draw(now) {
    frame = 0;
    const elapsed = lastTime ? Math.min(40, now - lastTime) : 16;
    lastTime = now;
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    for (const brick of bricks.values()) brick.target = 0;
    if (pointer) liftNearbyBricks();

    let moving = false;
    for (const [key, brick] of bricks) {
      const distance = brick.target - brick.lift;
      if (Math.abs(distance) < 0.006) {
        brick.lift = brick.target;
      } else {
        const duration = distance > 0 ? 65 : 130;
        brick.lift += distance * (1 - Math.exp(-elapsed / duration));
        moving = true;
      }

      if (brick.lift === 0) {
        bricks.delete(key);
        continue;
      }

      const top = brick.y - brick.height / 2 - brick.lift * 10;
      context.beginPath();
      context.roundRect(brick.x - 5.5, top, 11, brick.height, 2.3);
      context.globalAlpha = brick.lift;
      context.fillStyle = "#252527";
      context.fill();
      context.strokeStyle = "#4e4e51";
      context.stroke();
    }

    if (moving) schedule();
    else lastTime = 0;
  }

  function lowerBricks() {
    if (!pointer) return;
    pointer = null;
    schedule();
  }

  window.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" || !enabled.matches) return;
    if (event.target.closest(".join, .action, .logo-window")) {
      lowerBricks();
      return;
    }

    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", lowerBricks);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) reset();
  });
  window.addEventListener("blur", lowerBricks);
  window.addEventListener("resize", resize, { passive: true });
  enabled.addEventListener("change", resize);
  resize();
})();
