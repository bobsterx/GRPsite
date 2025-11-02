(function () {
  const WINTER_EVENT_ACTIVE = true;
  const SNOWFLAKE_COUNT = 90;

  if (!WINTER_EVENT_ACTIVE) {
    return;
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('winter-event');
    injectWinterLayers();
  });

  function injectWinterLayers() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow-container';
    snowContainer.setAttribute('aria-hidden', 'true');

    const glowLayer = document.createElement('div');
    glowLayer.className = 'winter-glow-layer';
    glowLayer.setAttribute('aria-hidden', 'true');

    document.body.appendChild(snowContainer);
    document.body.appendChild(glowLayer);

    if (prefersReducedMotion) {
      createStaticSnow(snowContainer, 25);
    } else {
      createAnimatedSnow(snowContainer, SNOWFLAKE_COUNT);
    }
  }

  function createAnimatedSnow(container, count) {
    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'snow-particle';

      const size = randomBetween(4, 10);
      const duration = randomBetween(12, 22);
      const delay = randomBetween(0, 12);
      const offset = randomBetween(-10, 110);
      const scale = randomBetween(0.5, 1.3);
      const wind = randomBetween(-40, 40);

      particle.style.setProperty('--size', `${size}px`);
      particle.style.setProperty('--duration', `${duration}s`);
      particle.style.setProperty('--delay', `${delay}s`);
      particle.style.setProperty('--x', `${offset}vw`);
      particle.style.setProperty('--scale', scale.toFixed(2));
      particle.style.setProperty('--wind', `${wind}px`);

      container.appendChild(particle);
    }
  }

  function createStaticSnow(container, count) {
    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'snow-particle';
      const offset = randomBetween(-5, 105);
      const vertical = randomBetween(0, 100);
      const size = randomBetween(5, 9);
      particle.style.setProperty('--x', `${offset}vw`);
      particle.style.top = `${vertical}vh`;
      particle.style.setProperty('--size', `${size}px`);
      particle.style.opacity = '0.5';
      container.appendChild(particle);
    }
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
})();
