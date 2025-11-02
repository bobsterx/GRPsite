(function () {
  const THEME_STORAGE_KEY = 'gravenholdrp-theme';

  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavigation();
    highlightNavigation();
    initHeroParallax();
    initRevealAnimations();
    document.body.classList.add('page-ready');
  });

  function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const defaultTheme = storedTheme || (prefersDark.matches ? 'dark' : 'light');

    setTheme(defaultTheme);

    prefersDark.addEventListener('change', (event) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    });

    toggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      const label = toggle.querySelector('.theme-label');
      if (label) {
        label.textContent = theme === 'dark' ? 'Темна' : 'Світла';
      }
    }
  }

  function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.getAttribute('data-state') === 'open';
      navLinks.setAttribute('data-state', isOpen ? 'closed' : 'open');
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.setAttribute('data-state', 'closed');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
        navLinks.setAttribute('data-state', 'closed');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        navLinks.setAttribute('data-state', 'closed');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function highlightNavigation() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const heroIntro = hero.querySelector('.hero-intro');
    const heroVisual = hero.querySelector('.hero-visual');
    if (!heroIntro || !heroVisual) return;

    let frameId;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    hero.addEventListener('mousemove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        heroIntro.style.setProperty('--tiltX', `${-x * 4}deg`);
        heroIntro.style.setProperty('--tiltY', `${y * 3}deg`);
        heroVisual.style.setProperty('--parallax', `${y * 20}px`);
      });
    });

    hero.addEventListener('mouseleave', () => {
      cancelAnimationFrame(frameId);
      heroIntro.style.setProperty('--tiltX', '0deg');
      heroIntro.style.setProperty('--tiltY', '0deg');
      heroVisual.style.setProperty('--parallax', '0px');
    });
  }

  function initRevealAnimations() {
    const revealItems = document.querySelectorAll('.reveal-on-scroll, .timeline-item');
    if (!revealItems.length) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
})();
