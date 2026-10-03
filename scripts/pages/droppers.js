export function initDroppersPage() {
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-infusion-category]'));
  if (!filters.length || !cards.length) return;

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedCategory = button.dataset.filter;

      filters.forEach((item) => item.classList.toggle('active', item === button));
      cards.forEach((card) => {
        card.hidden = selectedCategory !== 'all'
          && card.dataset.infusionCategory !== selectedCategory;
      });
    });
  });
}
