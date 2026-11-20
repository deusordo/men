const lightLogo = document.querySelector('.logo-window');

if (lightLogo) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const quietAreas = 'a, button, form, input, select, textarea, label, summary, [role="button"], [contenteditable], #join-panel, .logo-window, h1, h2, h3, p, li, figure';
  const lightLayer = document.createElement('div');
  const cursorLight = document.createElement('div');
  lightLayer.className = 'page-lights';
  lightLayer.setAttribute('aria-hidden', 'true');
  lightLayer.hidden = true;
  cursorLight.className = 'cursor-light';
  lightLayer.append(cursorLight);
  document.body.prepend(lightLayer);

  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let cursorFrame = 0;
  let cursorTimeout;

  function hideCursorLight() {
    cursorLight.classList.remove('is-visible');
    window.clearTimeout(cursorTimeout);
    window.cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
  }

  function moveCursorLight() {
    x += (targetX - x) * .24;
    y += (targetY - y) * .24;
    cursorLight.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    const stillMoving = Math.hypot(targetX - x, targetY - y) > .5;
    cursorFrame = stillMoving ? window.requestAnimationFrame(moveCursorLight) : 0;
  }

  document.addEventListener('pointermove', event => {
    if (lightLayer.hidden || !desktopPointer.matches || event.pointerType !== 'mouse') return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!cursorLight.classList.contains('is-visible')) {
      x = targetX;
      y = targetY;
      cursorLight.classList.add('is-visible');
    }
    if (!cursorFrame) cursorFrame = window.requestAnimationFrame(moveCursorLight);
    window.clearTimeout(cursorTimeout);
    cursorTimeout = window.setTimeout(hideCursorLight, 240);
  }, { passive: true });

  document.addEventListener('click', event => {
    if (lightLayer.hidden || !event.detail || !(event.target instanceof Element) || event.target.closest(quietAreas)) return;
    if (lightLayer.childElementCount >= 4) return;

    const ring = document.createElement('span');
    ring.className = 'light-pulse';
    ring.style.left = `${event.clientX}px`;
    ring.style.top = `${event.clientY}px`;
    ring.addEventListener('animationend', () => ring.remove(), { once: true });
    lightLayer.append(ring);
  }, { passive: true });

  function syncLighting() {
    lightLayer.hidden = motionPreference.matches || document.hidden;
    lightLogo.classList.toggle('lighting-enabled', !motionPreference.matches);
    document.documentElement.classList.toggle('light-page-hidden', document.hidden);
    if (lightLayer.hidden) {
      hideCursorLight();
      lightLayer.querySelectorAll('.light-pulse').forEach(ring => ring.remove());
    }
  }

  document.documentElement.addEventListener('pointerleave', hideCursorLight);
  window.addEventListener('blur', hideCursorLight);
  desktopPointer.addEventListener('change', hideCursorLight);
  motionPreference.addEventListener('change', syncLighting);
  document.addEventListener('visibilitychange', syncLighting);

  if ('IntersectionObserver' in window) {
    const logoVisibility = new IntersectionObserver(([entry]) => {
      lightLogo.classList.toggle('logo-offscreen', !entry.isIntersecting);
    });
    logoVisibility.observe(lightLogo);
  }
  syncLighting();
}
