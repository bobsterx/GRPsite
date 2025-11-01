(function () {
  document.addEventListener('DOMContentLoaded', () => {
    highlightNavigation();
    initHeroParallax();
    initScrollReveal();
    revealFeatureCards();
  });

  function highlightNavigation() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === current || (current === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const heroContent = hero.querySelector('.hero-content');
    let rafId;

    function onMove(event) {
      if (!heroContent) return;
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      cancelAnimationFrame(rafId);
      hero.classList.add('is-tilting');
      rafId = requestAnimationFrame(() => {
        hero.style.setProperty('--tiltX', `${-x * 4}deg`);
        hero.style.setProperty('--tiltY', `${y * 3}deg`);
      });
    }

    function resetTilt() {
      cancelAnimationFrame(rafId);
      hero.classList.remove('is-tilting');
      hero.style.setProperty('--tiltX', '0deg');
      hero.style.setProperty('--tiltY', '0deg');
    }

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', resetTilt);
  }

  function initScrollReveal() {
    const observed = document.querySelectorAll('[data-observe]');
    if (!observed.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            entry.target.style.setProperty('--reveal-delay', `${delay}ms`);
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observed.forEach((element) => observer.observe(element));
  }

  function revealFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      const delay = card.dataset.delay || 0;
      card.style.setProperty('--reveal-delay', `${delay}ms`);
    });
  }
})();
