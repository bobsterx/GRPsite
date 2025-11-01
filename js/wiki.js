document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach((header) => {
    header.addEventListener('click', () => toggleSection(header));
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSection(header);
      }
    });
  });

  function toggleSection(header) {
    const targetId = header.getAttribute('data-accordion');
    const target = document.getElementById(targetId);
    const item = header.closest('.accordion-item');
    const isActive = item?.classList.contains('active');

    document.querySelectorAll('.accordion-item').forEach((accordionItem) => {
      accordionItem.classList.remove('active');
    });
    document.querySelectorAll('.accordion-body').forEach((body) => {
      body.classList.remove('active');
    });
    headers.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));

    if (!isActive && item && target) {
      item.classList.add('active');
      target.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
    }
  }
});
