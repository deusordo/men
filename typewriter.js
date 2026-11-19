(() => {
  "use strict";

  const line = document.querySelector(".typewriter");
  const animated = line.querySelector(".typewriter-animated");
  const text = animated.querySelector(".typewriter-text");
  const logo = document.querySelector(".logo-window");
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  const phrases = ["Build the man.", "Move the rock.", "Build the brotherhood.", "Move the mountain."];
  let index = 0;
  let length = 0;
  let deleting = false;
  let delay = 360;
  let timer;
  let swept = false;

  function schedule() {
    clearTimeout(timer);
    if (motion.matches && !document.hidden) timer = setTimeout(advance, delay);
  }

  function advance() {
    const phrase = phrases[index];
    length += deleting ? -1 : 1;
    text.textContent = phrase.slice(0, length);

    if (length === phrase.length) {
      deleting = true;
      delay = 2350;
      if (!swept) {
        logo.classList.add("is-sweeping");
        swept = true;
      }
    } else if (length === 0) {
      deleting = false;
      index = (index + 1) % phrases.length;
      delay = 420;
    } else {
      delay = deleting ? 42 : 72;
    }

    schedule();
  }

  function updateMotion() {
    line.querySelector(".typewriter-static").classList.toggle("visually-hidden", motion.matches);
    animated.hidden = !motion.matches;
    if (!motion.matches) logo.classList.remove("is-sweeping");
    schedule();
  }

  logo.addEventListener("animationend", event => {
    if (event.animationName === "logo-sweep") logo.classList.remove("is-sweeping");
  });
  motion.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", schedule);
  updateMotion();
})();
