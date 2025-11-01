document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.accordion-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => toggle(trigger));
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle(trigger);
      }
    });
  });

  function toggle(trigger) {
    const item = trigger.closest('.accordion-item');
    if (!item) return;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.accordion-item').forEach((entry) => {
      entry.classList.remove('active');
      entry.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
    });

    if (!isExpanded) {
      item.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
    }
  }
});
