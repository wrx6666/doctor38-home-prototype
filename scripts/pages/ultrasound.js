import { servicePriceCatalog } from '../data/service-prices.js';

const INITIAL_LIMIT = 14;
const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const ultrasoundGroups = [
  { id: 'checkups', label: 'Комплексные программы', pattern: /чекап/ },
  { id: 'pregnancy', label: 'Беременность', pattern: /беремен|плода|плацент|фетометр|амниот|сердцебиен|цервикометр|обвити|триместр|сосудов матки/ },
  { id: 'children', label: 'Детям', pattern: /нейросонограф|новорожден|для девочек/ },
  { id: 'women', label: 'Женское здоровье', pattern: /матки и придатков|фолликул|молочных желез|после м\/а|после манипуляции/ },
  { id: 'men', label: 'Мужское здоровье', pattern: /мошон|предстатель|трузи|семенных пузырьков/ },
  { id: 'vessels', label: 'Сосуды и сердце', pattern: /дуплекс|сердца|эхокг/ },
  { id: 'organs', label: 'Внутренние органы', pattern: /брюш|печен|желч|селез|поджелуд|почек|мочевого пузыря|надпочеч|эластограф|плевраль/ },
  { id: 'tissues', label: 'Железы и мягкие ткани', pattern: /щитовид|лимфат|мягких ткан|кожных покров|поверхностных структур/ },
  { id: 'other', label: 'Дополнительные процедуры', pattern: /.*/ },
];

function normalize(value) {
  return String(value || '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPrice(price) {
  return price > 0 ? `${priceFormatter.format(price)} ₽` : 'Уточнить';
}

function getServiceWord(count) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'исследований';
  if (mod10 === 1) return 'исследование';
  if (mod10 >= 2 && mod10 <= 4) return 'исследования';
  return 'исследований';
}

function getPositionWord(count) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'позиций';
  if (mod10 === 1) return 'позиция';
  if (mod10 >= 2 && mod10 <= 4) return 'позиции';
  return 'позиций';
}

function getGroupId(serviceName) {
  const name = normalize(serviceName);
  return ultrasoundGroups.find(({ pattern }) => pattern.test(name))?.id || 'other';
}

const ultrasoundLandingPages = [
  { pattern: /сердца|эхокг/, href: 'echocardiography.html' },
  { pattern: /матки и придатков|малого таза|фолликул/, href: 'ultrasound-pelvis.html' },
  { pattern: /почек|надпочечников|мочевого пузыря/, href: 'ultrasound-kidneys.html' },
  { pattern: /брюшной полости|гепатобилиар|печени|желчного пузыря|селезёнки|поджелудочной/, href: 'ultrasound-abdomen.html' },
];

function getLandingPage(serviceName) {
  const normalizedName = normalize(serviceName);
  return ultrasoundLandingPages.find(({ pattern }) => pattern.test(normalizedName))?.href || 'appointment.html';
}

function createFilterButton(group, count, isAll = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.ultrasoundFilter = isAll ? 'all' : group.id;
  button.setAttribute('aria-pressed', 'false');

  const label = document.createElement('span');
  label.textContent = isAll ? 'Все УЗИ' : group.label;
  const badge = document.createElement('small');
  badge.textContent = String(count);
  button.append(label, badge);
  return button;
}

function createUltrasoundSection(group, services) {
  const section = document.createElement('section');
  section.className = 'price-group';
  section.id = group.id;
  section.dataset.ultrasoundSection = group.id;
  section.dataset.reveal = '';

  const head = document.createElement('div');
  head.className = 'group-head';
  const titleWrap = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Ультразвуковая диагностика';
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
    row.href = getLandingPage(service.name);
    row.dataset.ultrasoundItem = '';
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
  moreButton.dataset.ultrasoundMore = group.id;
  moreButton.textContent = 'Показать все';
  section.append(head, table, moreButton);
  return section;
}

export function initUltrasoundPage() {
  const sidebar = document.querySelector('[data-ultrasound-sidebar]');
  const groupsRoot = document.querySelector('[data-ultrasound-groups]');
  if (!sidebar || !groupsRoot) return;

  const services = servicePriceCatalog.services.filter(({ category }) => category === 'ultrasound');
  const groupedServices = new Map(ultrasoundGroups.map((group) => [group.id, []]));
  services.forEach((service) => groupedServices.get(getGroupId(service.name)).push(service));
  const visibleGroups = ultrasoundGroups.filter((group) => groupedServices.get(group.id).length > 0);

  sidebar.replaceChildren(
    createFilterButton({ id: 'all', label: 'Все УЗИ' }, services.length, true),
    ...visibleGroups.map((group) => createFilterButton(group, groupedServices.get(group.id).length)),
  );
  groupsRoot.replaceChildren(
    ...visibleGroups.map((group) => createUltrasoundSection(group, groupedServices.get(group.id))),
  );

  const filterButtons = Array.from(sidebar.querySelectorAll('[data-ultrasound-filter]'));
  const sections = Array.from(groupsRoot.querySelectorAll('[data-ultrasound-section]'));
  const searchInput = document.querySelector('#ultrasoundSearch');
  const emptyMessage = document.querySelector('#ultrasoundEmpty');
  const resultsMessage = document.querySelector('#ultrasoundResults');
  const expandedSections = new Set();
  const hashFilter = window.location.hash.slice(1);
  const availableFilters = filterButtons.map((button) => button.dataset.ultrasoundFilter);
  let activeFilter = availableFilters.includes(hashFilter) ? hashFilter : 'all';

  const applyFilters = () => {
    const query = normalize(searchInput?.value);
    let visibleSectionCount = 0;
    let totalMatches = 0;

    sections.forEach((section) => {
      const sectionId = section.dataset.ultrasoundSection;
      const categoryMatches = activeFilter === 'all' || activeFilter === sectionId;
      const items = Array.from(section.querySelectorAll('[data-ultrasound-item]'));
      const matchingItems = categoryMatches
        ? items.filter((item) => !query || item.dataset.searchText.includes(query))
        : [];
      const limit = query || expandedSections.has(sectionId) ? matchingItems.length : INITIAL_LIMIT;

      items.forEach((item) => { item.hidden = true; });
      matchingItems.slice(0, limit).forEach((item) => { item.hidden = false; });
      section.hidden = matchingItems.length === 0;
      if (matchingItems.length) visibleSectionCount += 1;
      totalMatches += matchingItems.length;

      const moreButton = section.querySelector('[data-ultrasound-more]');
      if (moreButton) {
        const hiddenCount = matchingItems.length - limit;
        moreButton.hidden = Boolean(query) || hiddenCount <= 0;
        if (!moreButton.hidden) moreButton.textContent = `Показать ещё ${hiddenCount}`;
      }
    });

    filterButtons.forEach((button) => {
      const isActive = button.dataset.ultrasoundFilter === activeFilter;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (emptyMessage) emptyMessage.hidden = visibleSectionCount > 0;
    if (resultsMessage) {
      if (query) {
        resultsMessage.textContent = `Найдено: ${totalMatches}`;
      } else if (activeFilter === 'all') {
        resultsMessage.textContent = `В прайсе ${services.length} ${getPositionWord(services.length)} УЗИ`;
      } else {
        const activeGroup = visibleGroups.find(({ id }) => id === activeFilter);
        resultsMessage.textContent = `${activeGroup?.label || 'Раздел'}: ${totalMatches}`;
      }
    }
  };

  sidebar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ultrasound-filter]');
    if (!button) return;
    activeFilter = button.dataset.ultrasoundFilter;
    const nextUrl = activeFilter === 'all' ? window.location.pathname : `${window.location.pathname}#${activeFilter}`;
    window.history.replaceState(null, '', nextUrl);
    applyFilters();
  });

  groupsRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ultrasound-more]');
    if (!button) return;
    expandedSections.add(button.dataset.ultrasoundMore);
    applyFilters();
  });

  searchInput?.addEventListener('input', applyFilters);
  applyFilters();
}
