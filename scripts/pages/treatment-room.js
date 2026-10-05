import { servicePriceCatalog } from '../data/service-prices.js';

const INITIAL_LIMIT = 10;
const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const treatmentGroups = [
  {
    id: 'injections',
    label: 'Инъекции и инфузии',
    eyebrow: 'Процедуры',
    matches: (name) => /инъекц|капельное|слив крови/i.test(name),
  },
  {
    id: 'care',
    label: 'Медицинские манипуляции',
    eyebrow: 'Процедурный кабинет',
    matches: (name) => /измерение|снятие шв|лечение мастит|забор анализов|перевязка/i.test(name),
  },
  {
    id: 'vlok',
    label: 'ВЛОК',
    eyebrow: 'Физиотерапевтические процедуры',
    matches: (name) => /влок/i.test(name),
  },
  {
    id: 'research',
    label: 'Исследования',
    eyebrow: 'Позиции из раздела прайса',
    matches: () => true,
  },
];

function normalize(value) {
  return String(value || '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatName(value) {
  const name = String(value || '').trim().replaceAll(',', ', ');
  return name ? `${name.charAt(0).toLocaleUpperCase('ru-RU')}${name.slice(1)}` : '';
}

function formatPrice(price) {
  return `${priceFormatter.format(price)} ₽`;
}

function getServiceWord(count) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'позиций';
  if (mod10 === 1) return 'позиция';
  if (mod10 >= 2 && mod10 <= 4) return 'позиции';
  return 'позиций';
}

function groupServices(services) {
  const groups = new Map(treatmentGroups.map((group) => [group.id, []]));
  services.forEach((service) => {
    const group = treatmentGroups.find(({ matches }) => matches(service.name));
    groups.get(group.id).push(service);
  });
  return groups;
}

function createFilter(group, count, isAll = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.treatmentFilter = isAll ? 'all' : group.id;
  button.setAttribute('aria-pressed', 'false');

  const label = document.createElement('span');
  label.textContent = isAll ? 'Все услуги' : group.label;
  const badge = document.createElement('small');
  badge.textContent = String(count);
  button.append(label, badge);
  return button;
}

function createSection(group, services) {
  const section = document.createElement('section');
  section.className = 'price-group';
  section.id = group.id;
  section.dataset.treatmentSection = group.id;
  section.dataset.reveal = '';

  const head = document.createElement('div');
  head.className = 'group-head';
  const titleWrap = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = group.eyebrow;
  const title = document.createElement('h2');
  title.textContent = group.label;
  const count = document.createElement('span');
  count.className = 'document-count';
  count.textContent = `${services.length} ${getServiceWord(services.length)}`;
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
    row.dataset.treatmentItem = '';
    row.dataset.searchText = normalize(service.name);

    const name = document.createElement('span');
    name.textContent = formatName(service.name);
    const price = document.createElement('b');
    price.textContent = formatPrice(service.price);
    row.append(name, price);
    table.append(row);
  });

  const moreButton = document.createElement('button');
  moreButton.className = 'price-more';
  moreButton.type = 'button';
  moreButton.dataset.treatmentMore = group.id;
  moreButton.textContent = 'Показать все';
  section.append(head, table, moreButton);
  return section;
}

export function initTreatmentRoomPage() {
  const sidebar = document.querySelector('[data-treatment-sidebar]');
  const groupsRoot = document.querySelector('[data-treatment-groups]');
  const searchInput = document.querySelector('#treatmentSearch');
  const resultsMessage = document.querySelector('#treatmentResults');
  const emptyMessage = document.querySelector('#treatmentEmpty');
  if (!sidebar || !groupsRoot || !searchInput || !resultsMessage || !emptyMessage) return;

  const services = servicePriceCatalog.services.filter(({ category }) => category === 'treatment-room');
  const groupedServices = groupServices(services);
  const visibleGroups = treatmentGroups.filter((group) => groupedServices.get(group.id).length > 0);

  sidebar.replaceChildren(
    createFilter({ id: 'all', label: 'Все услуги' }, services.length, true),
    ...visibleGroups.map((group) => createFilter(group, groupedServices.get(group.id).length)),
  );
  groupsRoot.replaceChildren(
    ...visibleGroups.map((group) => createSection(group, groupedServices.get(group.id))),
  );

  const filterButtons = Array.from(sidebar.querySelectorAll('[data-treatment-filter]'));
  const sections = Array.from(groupsRoot.querySelectorAll('[data-treatment-section]'));
  const expandedSections = new Set();
  const hashFilter = window.location.hash.slice(1);
  const availableFilters = filterButtons.map((button) => button.dataset.treatmentFilter);
  let activeFilter = availableFilters.includes(hashFilter) ? hashFilter : 'all';

  const applyFilters = () => {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    filterButtons.forEach((button) => {
      const active = button.dataset.treatmentFilter === activeFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    sections.forEach((section) => {
      const groupId = section.dataset.treatmentSection;
      const groupIsVisible = activeFilter === 'all' || activeFilter === groupId;
      const items = Array.from(section.querySelectorAll('[data-treatment-item]'));
      const matches = items.filter((item) => !query || item.dataset.searchText.includes(query));
      const expanded = expandedSections.has(groupId) || Boolean(query) || activeFilter !== 'all';

      items.forEach((item) => {
        const matchesSearch = !query || item.dataset.searchText.includes(query);
        const index = matches.indexOf(item);
        item.hidden = !groupIsVisible || !matchesSearch || (!expanded && index >= INITIAL_LIMIT);
      });

      const visibleInGroup = groupIsVisible ? matches.length : 0;
      visibleCount += visibleInGroup;
      section.hidden = visibleInGroup === 0;

      const count = section.querySelector('.document-count');
      if (count) count.textContent = `${visibleInGroup} ${getServiceWord(visibleInGroup)}`;
      const moreButton = section.querySelector('[data-treatment-more]');
      if (moreButton) {
        const hiddenCount = Math.max(0, visibleInGroup - INITIAL_LIMIT);
        moreButton.hidden = expanded || hiddenCount === 0;
        moreButton.textContent = `Показать ещё ${hiddenCount}`;
      }
    });

    resultsMessage.textContent = query
      ? `Найдено: ${visibleCount}`
      : `Показано: ${visibleCount} из ${services.length}`;
    emptyMessage.hidden = visibleCount !== 0;
  };

  sidebar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-treatment-filter]');
    if (!button) return;
    activeFilter = button.dataset.treatmentFilter;
    history.replaceState(null, '', activeFilter === 'all' ? 'treatment-room.html' : `#${activeFilter}`);
    applyFilters();
  });

  groupsRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-treatment-more]');
    if (!button) return;
    expandedSections.add(button.dataset.treatmentMore);
    applyFilters();
  });

  searchInput.addEventListener('input', applyFilters);
  applyFilters();

  if (activeFilter !== 'all') {
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-treatment-section="${activeFilter}"]`)?.scrollIntoView({ block: 'start' });
    });
  }
}
