function normalize(value) {
  return value.toLocaleLowerCase('ru-RU').trim();
}

export function initPricesPage() {
  const filterButtons = Array.from(document.querySelectorAll('[data-price-filter]'));
  const sections = Array.from(document.querySelectorAll('[data-price-section]'));
  if (!filterButtons.length || !sections.length) return;

  const searchInput = document.querySelector('#priceSearch');
  const emptyMessage = document.querySelector('#priceEmpty');
  const availableFilters = filterButtons.map((button) => button.dataset.priceFilter);
  const hashFilter = window.location.hash.slice(1);
  let activeFilter = availableFilters.includes(hashFilter) ? hashFilter : 'all';

  const applyFilters = () => {
    const query = normalize(searchInput?.value || '');
    let visibleSectionCount = 0;

    sections.forEach((section) => {
      const matchesCategory = activeFilter === 'all'
        || section.dataset.priceSection === activeFilter;
      let visibleItemCount = 0;

      section.querySelectorAll('[data-price-item]').forEach((item) => {
        const matchesSearch = normalize(item.textContent || '').includes(query);
        const isVisible = matchesCategory && matchesSearch;
        item.hidden = !isVisible;
        if (isVisible) visibleItemCount += 1;
      });

      const isVisible = matchesCategory && visibleItemCount > 0;
      section.hidden = !isVisible;
      if (isVisible) visibleSectionCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleSectionCount > 0;
  };

  filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.priceFilter === activeFilter);
    button.addEventListener('click', () => {
      activeFilter = button.dataset.priceFilter;
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));

      const nextUrl = activeFilter === 'all'
        ? window.location.pathname
        : `${window.location.pathname}#${activeFilter}`;
      window.history.replaceState(null, '', nextUrl);
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', applyFilters);
  applyFilters();

  if (hashFilter && activeFilter !== 'all') {
    window.requestAnimationFrame(() => {
      document.querySelector('.prices-page')?.scrollIntoView({ block: 'start' });
    });
  }
}
