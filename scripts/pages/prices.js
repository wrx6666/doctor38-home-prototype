import { servicePriceCatalog } from '../data/service-prices.js';

const INITIAL_ALL_LIMIT = 7;
const INITIAL_CATEGORY_LIMIT = 30;
const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

function normalize(value) {
  return String(value || '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPrice(price) {
  return `${priceFormatter.format(price)} ₽`;
}

function getServiceWord(count) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'услуг';
  if (mod10 === 1) return 'услуга';
  if (mod10 >= 2 && mod10 <= 4) return 'услуги';
  return 'услуг';
}

function createFilterButton(category, isAll = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.priceFilter = isAll ? 'all' : category.id;
  button.setAttribute('aria-pressed', 'false');

  const label = document.createElement('span');
  label.textContent = isAll ? 'Все услуги' : category.label;
  button.append(label);

  const count = document.createElement('small');
  count.textContent = String(isAll ? servicePriceCatalog.total : category.count);
  button.append(count);
  return button;
}

function createPriceSection(category, services) {
  const section = document.createElement('section');
  section.className = 'price-group';
  section.id = category.id;
  section.dataset.priceSection = category.id;

  const head = document.createElement('div');
  head.className = 'group-head';

  const titleWrap = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = category.eyebrow;

  const title = document.createElement('h2');
  title.textContent = category.label;
  const count = document.createElement('span');
  count.className = 'document-count';
  count.textContent = `${category.count} ${getServiceWord(category.count)}`;
  title.append(count);
  titleWrap.append(eyebrow, title);

  const directionLink = document.createElement('a');
  directionLink.className = 'text-link';
  directionLink.href = category.href;
  directionLink.textContent = 'Перейти к направлению';
  head.append(titleWrap, directionLink);

  const table = document.createElement('div');
  table.className = 'price-table';

  services.forEach((service) => {
    const row = document.createElement('a');
    row.href = category.href;
    row.dataset.priceItem = '';
    row.dataset.searchText = normalize(`${service.name} ${category.label}`);

    const name = document.createElement('span');
    name.textContent = service.name;
    const price = document.createElement('b');
    price.textContent = formatPrice(service.price);
    row.append(name, price);
    table.append(row);
  });

  const moreButton = document.createElement('button');
  moreButton.className = 'price-more';
  moreButton.type = 'button';
  moreButton.dataset.priceMore = category.id;
  moreButton.textContent = 'Показать все услуги раздела';

  section.append(head, table, moreButton);
  return section;
}

export function initPricesPage() {
  const sidebar = document.querySelector('[data-price-sidebar]');
  const groups = document.querySelector('[data-price-groups]');
  if (!sidebar || !groups) return;

  const servicesByCategory = new Map(
    servicePriceCatalog.categories.map((category) => [
      category.id,
      servicePriceCatalog.services.filter((service) => service.category === category.id),
    ]),
  );

  sidebar.replaceChildren(
    createFilterButton({ count: servicePriceCatalog.total }, true),
    ...servicePriceCatalog.categories.map((category) => createFilterButton(category)),
  );
  groups.replaceChildren(
    ...servicePriceCatalog.categories.map((category) => (
      createPriceSection(category, servicesByCategory.get(category.id) || [])
    )),
  );
  sidebar.setAttribute('aria-busy', 'false');
  groups.setAttribute('aria-busy', 'false');

  const filterButtons = Array.from(sidebar.querySelectorAll('[data-price-filter]'));
  const sections = Array.from(groups.querySelectorAll('[data-price-section]'));
  const searchInput = document.querySelector('#priceSearch');
  const emptyMessage = document.querySelector('#priceEmpty');
  const resultsMessage = document.querySelector('#priceResults');
  const expandedSections = new Set();
  const availableFilters = filterButtons.map((button) => button.dataset.priceFilter);
  const hashFilter = window.location.hash.slice(1);
  let activeFilter = availableFilters.includes(hashFilter) ? hashFilter : 'all';

  const applyFilters = () => {
    const query = normalize(searchInput?.value);
    let visibleSectionCount = 0;
    let totalMatches = 0;

    sections.forEach((section) => {
      const sectionId = section.dataset.priceSection;
      const matchesCategory = activeFilter === 'all' || sectionId === activeFilter;
      const items = Array.from(section.querySelectorAll('[data-price-item]'));
      const matchingItems = matchesCategory
        ? items.filter((item) => !query || item.dataset.searchText.includes(query))
        : [];
      const defaultLimit = activeFilter === 'all' ? INITIAL_ALL_LIMIT : INITIAL_CATEGORY_LIMIT;
      const visibleLimit = query || expandedSections.has(sectionId)
        ? matchingItems.length
        : defaultLimit;

      items.forEach((item) => { item.hidden = true; });
      matchingItems.slice(0, visibleLimit).forEach((item) => { item.hidden = false; });

      const isVisible = matchingItems.length > 0;
      section.hidden = !isVisible;
      if (isVisible) visibleSectionCount += 1;
      totalMatches += matchingItems.length;

      const moreButton = section.querySelector('[data-price-more]');
      if (moreButton) {
        const hiddenCount = matchingItems.length - visibleLimit;
        moreButton.hidden = Boolean(query) || hiddenCount <= 0;
        if (!moreButton.hidden) {
          moreButton.textContent = `Показать ещё ${hiddenCount}`;
        }
      }
    });

    filterButtons.forEach((button) => {
      const isActive = button.dataset.priceFilter === activeFilter;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (emptyMessage) emptyMessage.hidden = visibleSectionCount > 0;
    if (resultsMessage) {
      const activeCategory = servicePriceCatalog.categories.find(({ id }) => id === activeFilter);
      if (query) {
        resultsMessage.textContent = `Найдено: ${totalMatches}`;
      } else if (activeCategory) {
        resultsMessage.textContent = `${activeCategory.label}: ${totalMatches}`;
      } else {
        resultsMessage.textContent = `В прайсе ${servicePriceCatalog.total} услуг`;
      }
    }
  };

  sidebar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-price-filter]');
    if (!button) return;
    activeFilter = button.dataset.priceFilter;
    const nextUrl = activeFilter === 'all'
      ? window.location.pathname
      : `${window.location.pathname}#${activeFilter}`;
    window.history.replaceState(null, '', nextUrl);
    applyFilters();
  });

  groups.addEventListener('click', (event) => {
    const button = event.target.closest('[data-price-more]');
    if (!button) return;
    expandedSections.add(button.dataset.priceMore);
    applyFilters();
  });

  searchInput?.addEventListener('input', applyFilters);
  applyFilters();

  if (hashFilter && activeFilter !== 'all') {
    window.requestAnimationFrame(() => {
      document.querySelector('.prices-page')?.scrollIntoView({ block: 'start' });
    });
  }
}
