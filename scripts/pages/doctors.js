const DEFAULT_FILTERS = {
  specialty: 'all',
  branch: 'all'
};

export function initDoctorsPage() {
  const cards = Array.from(document.querySelectorAll('.doctor-card'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-group]'));
  if (!cards.length || !filterButtons.length) return;

  const filters = { ...DEFAULT_FILTERS };
  const emptyMessage = document.querySelector('.doctor-empty');
  const content = document.querySelector('.doctors-body');

  const scrollToContent = () => {
    if (!content) return;

    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
    const top = content.getBoundingClientRect().top + window.scrollY - headerOffset - 18;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const applyFilters = () => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const specialties = (card.dataset.specialty || '').split(/\s+/).filter(Boolean);
      const branches = (card.dataset.branch || '').split(/\s+/).filter(Boolean);
      const matchesSpecialty = filters.specialty === 'all' || specialties.includes(filters.specialty);
      const matchesBranch = filters.branch === 'all' || branches.includes(filters.branch);
      const isVisible = matchesSpecialty && matchesBranch;

      card.classList.toggle('is-hidden', !isVisible);
      if (isVisible) visibleCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
  };

  const setActiveFilter = (group, requestedValue) => {
    const groupButtons = filterButtons.filter((button) => button.dataset.filterGroup === group);
    const targetButton = groupButtons.find((button) => button.dataset.filterValue === requestedValue)
      || groupButtons.find((button) => button.dataset.filterValue === 'all');
    if (!targetButton) return;

    filters[group] = targetButton.dataset.filterValue;
    groupButtons.forEach((button) => button.classList.toggle('active', button === targetButton));
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveFilter(button.dataset.filterGroup, button.dataset.filterValue);
      applyFilters();
      window.requestAnimationFrame(scrollToContent);
    });
  });

  const params = new URLSearchParams(window.location.search);
  setActiveFilter('specialty', params.get('specialty') || 'all');
  setActiveFilter('branch', params.get('branch') || 'all');
  applyFilters();
}
