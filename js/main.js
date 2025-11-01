(function () {
  document.addEventListener('DOMContentLoaded', () => {
    highlightNavigation();
    initHeroParallax();
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

  function revealFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    cards.forEach((card) => observer.observe(card));
  }
})();
