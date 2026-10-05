import { servicePriceCatalog } from '../data/service-prices.js';

const INITIAL_LIMIT = 24;
const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const analysisGroups = [
  { id: 'a-v', label: 'А–В', letters: 'абв' },
  { id: 'g-e', label: 'Г–Е', letters: 'гдеё' },
  { id: 'zh-k', label: 'Ж–К', letters: 'жзийк' },
  { id: 'l-o', label: 'Л–О', letters: 'лмно' },
  { id: 'p-s', label: 'П–С', letters: 'прс' },
  { id: 't-ya', label: 'Т–Я', letters: 'туфхцчшщъыьэюя' },
  { id: 'other', label: 'Цифры и латиница', letters: '' },
];

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

function getAnalysisWord(count) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'исследований';
  if (mod10 === 1) return 'исследование';
  if (mod10 >= 2 && mod10 <= 4) return 'исследования';
  return 'исследований';
}

function getGroupId(serviceName) {
  const firstLetter = normalize(serviceName).charAt(0);
  const group = analysisGroups
    .filter(({ id }) => id !== 'other')
    .find(({ letters }) => letters.includes(firstLetter));
  return group?.id || 'other';
}

function createFilterButton(group, count, isAll = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.analysisFilter = isAll ? 'all' : group.id;
  button.setAttribute('aria-pressed', 'false');

  const label = document.createElement('span');
  label.textContent = isAll ? 'Все анализы' : group.label;
  const badge = document.createElement('small');
  badge.textContent = String(count);
  button.append(label, badge);
  return button;
}

function createAnalysisSection(group, services) {
  const section = document.createElement('section');
  section.className = 'price-group';
  section.id = group.id;
  section.dataset.analysisSection = group.id;
  section.dataset.reveal = '';

  const head = document.createElement('div');
  head.className = 'group-head';
  const titleWrap = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Лабораторная диагностика';
  const title = document.createElement('h2');
  title.textContent = group.label;
  const count = document.createElement('span');
  count.className = 'document-count';
  count.textContent = `${services.length} ${getAnalysisWord(services.length)}`;
  title.append(count);
  titleWrap.append(eyebrow, title);

  const appointmentLink = document.createElement('a');
  appointmentLink.className = 'text-link';
  appointmentLink.href = 'appointment.html';
  appointmentLink.textContent = 'Записаться';
  head.append(titleWrap, appointmentLink);

  const table = document.createElement('div');
  table.className = 'price-table';
  services.forEach((service) => {
    const row = document.createElement('a');
    row.href = 'appointment.html';
    row.dataset.analysisItem = '';
    row.dataset.searchText = normalize(service.name);
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
  moreButton.dataset.analysisMore = group.id;
  moreButton.textContent = 'Показать все';
  section.append(head, table, moreButton);
  return section;
}

export function initAnalysesPage() {
  const sidebar = document.querySelector('[data-analysis-sidebar]');
  const groupsRoot = document.querySelector('[data-analysis-groups]');
  if (!sidebar || !groupsRoot) return;

  const services = servicePriceCatalog.services.filter(({ category }) => category === 'laboratory');
  const groupedServices = new Map(analysisGroups.map((group) => [group.id, []]));
  services.forEach((service) => groupedServices.get(getGroupId(service.name)).push(service));
  const visibleGroups = analysisGroups.filter((group) => groupedServices.get(group.id).length > 0);

  sidebar.replaceChildren(
    createFilterButton({ id: 'all', label: 'Все анализы' }, services.length, true),
    ...visibleGroups.map((group) => createFilterButton(group, groupedServices.get(group.id).length)),
  );
  groupsRoot.replaceChildren(
    ...visibleGroups.map((group) => createAnalysisSection(group, groupedServices.get(group.id))),
  );

  const filterButtons = Array.from(sidebar.querySelectorAll('[data-analysis-filter]'));
  const sections = Array.from(groupsRoot.querySelectorAll('[data-analysis-section]'));
  const searchInput = document.querySelector('#analysisSearch');
  const emptyMessage = document.querySelector('#analysisEmpty');
  const resultsMessage = document.querySelector('#analysisResults');
  const expandedSections = new Set();
  const hashFilter = window.location.hash.slice(1);
  const availableFilters = filterButtons.map((button) => button.dataset.analysisFilter);
  let activeFilter = availableFilters.includes(hashFilter) ? hashFilter : 'all';

  const applyFilters = () => {
    const query = normalize(searchInput?.value);
    let visibleSectionCount = 0;
    let totalMatches = 0;

    sections.forEach((section) => {
      const sectionId = section.dataset.analysisSection;
      const categoryMatches = activeFilter === 'all' || activeFilter === sectionId;
      const items = Array.from(section.querySelectorAll('[data-analysis-item]'));
      const matchingItems = categoryMatches
        ? items.filter((item) => !query || item.dataset.searchText.includes(query))
        : [];
      const limit = query || expandedSections.has(sectionId) ? matchingItems.length : INITIAL_LIMIT;

      items.forEach((item) => { item.hidden = true; });
      matchingItems.slice(0, limit).forEach((item) => { item.hidden = false; });
      section.hidden = matchingItems.length === 0;
      if (matchingItems.length) visibleSectionCount += 1;
      totalMatches += matchingItems.length;

      const moreButton = section.querySelector('[data-analysis-more]');
      if (moreButton) {
        const hiddenCount = matchingItems.length - limit;
        moreButton.hidden = Boolean(query) || hiddenCount <= 0;
        if (!moreButton.hidden) moreButton.textContent = `Показать ещё ${hiddenCount}`;
      }
    });

    filterButtons.forEach((button) => {
      const isActive = button.dataset.analysisFilter === activeFilter;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (emptyMessage) emptyMessage.hidden = visibleSectionCount > 0;
    if (resultsMessage) {
      if (query) {
        resultsMessage.textContent = `Найдено: ${totalMatches}`;
      } else if (activeFilter === 'all') {
        resultsMessage.textContent = `В прайсе ${services.length} лабораторных исследований`;
      } else {
        const activeGroup = visibleGroups.find(({ id }) => id === activeFilter);
        resultsMessage.textContent = `${activeGroup?.label || 'Раздел'}: ${totalMatches}`;
      }
    }
  };

  sidebar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-analysis-filter]');
    if (!button) return;
    activeFilter = button.dataset.analysisFilter;
    const nextUrl = activeFilter === 'all' ? window.location.pathname : `${window.location.pathname}#${activeFilter}`;
    window.history.replaceState(null, '', nextUrl);
    applyFilters();
  });

  groupsRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-analysis-more]');
    if (!button) return;
    expandedSections.add(button.dataset.analysisMore);
    applyFilters();
  });

  searchInput?.addEventListener('input', applyFilters);
  applyFilters();
}
