import { servicePriceCatalog } from '../data/service-prices.js';

const INITIAL_LIMIT = 6;
const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

const groups = [
  { id: 'care', label: 'Консультации и уход', test: /консультац|прием косметолог|чистк|уход|маск|массаж|карбокс|микроток|озонотерап/i },
  { id: 'peels', label: 'Пилинги', test: /пилинг|peel/i },
  { id: 'injections', label: 'Инъекционная косметология', test: /биоревитал|мезотерап|плазм|коллагенотерап|коллост|лаеннек|мэлсмон|интралипотерап|гиалуронов|липолит/i },
  { id: 'contour', label: 'Контурная пластика', test: /контур|моделирован|filer|филлер|belotero|repart|miraline|radiesse|regenyal|aliaxin/i },
  { id: 'botulinum', label: 'Ботулинотерапия', test: /ботулин|диспорт|ксеомин|гипергидроз|миотокс/i },
  { id: 'hardware', label: 'Аппаратные методики', test: /\brf\b|смас|smas|лифтинг|микроиголь|фотоомолож|аппарат/i },
  { id: 'removal', label: 'Удаление новообразований', test: /лазер|удален|невус|папилл|кератом|ксантелаз|новообраз|бородав|кондилом|милиум|гемангиом/i },
  { id: 'additional', label: 'Дополнительные процедуры', test: null },
];

const normalize = (value) => String(value || '')
  .toLocaleLowerCase('ru-RU')
  .replaceAll('ё', 'е')
  .replace(/\s+/g, ' ')
  .trim();

const publicName = (name) => name
  .replaceAll('Власова А.В.', 'Мясникова А.В.')
  .replaceAll('Власова А. В.', 'Мясникова А.В.');

const formatPrice = (price) => `${priceFormatter.format(price)} ₽`;

function classify(service) {
  return groups.find((group) => group.test?.test(service.name))?.id || 'additional';
}

function createFilter(group, count, active) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.cosmetologyFilter = group.id;
  button.classList.toggle('active', active);
  button.setAttribute('aria-pressed', String(active));
  button.innerHTML = `<span>${group.label}</span><small>${count}</small>`;
  return button;
}

function createPriceGroup(group, services, expanded, query) {
  const section = document.createElement('section');
  section.className = 'cosmetology-price-group';
  section.dataset.cosmetologyGroup = group.id;

  const head = document.createElement('div');
  head.className = 'cosmetology-price-head';
  const title = document.createElement('h3');
  title.textContent = group.label;
  const count = document.createElement('span');
  count.textContent = `${services.length} поз.`;
  head.append(title, count);

  const list = document.createElement('div');
  list.className = 'cosmetology-price-list';
  const visible = query || expanded ? services : services.slice(0, INITIAL_LIMIT);
  visible.forEach((service) => {
    const row = document.createElement('a');
    row.href = 'appointment.html?branch=gavrilova';
    const name = document.createElement('span');
    name.textContent = publicName(service.name);
    const price = document.createElement('b');
    price.textContent = formatPrice(service.price);
    row.append(name, price);
    list.append(row);
  });

  section.append(head, list);
  if (!query && services.length > INITIAL_LIMIT) {
    const more = document.createElement('button');
    more.className = 'cosmetology-price-more';
    more.type = 'button';
    more.dataset.cosmetologyMore = group.id;
    more.textContent = expanded ? 'Свернуть список' : `Показать ещё ${services.length - INITIAL_LIMIT}`;
    section.append(more);
  }
  return section;
}

export function initCosmetologyPage() {
  const filters = document.querySelector('[data-cosmetology-filters]');
  const container = document.querySelector('[data-cosmetology-groups]');
  const search = document.querySelector('#cosmetologySearch');
  const result = document.querySelector('#cosmetologyResult');
  if (!filters || !container || !search || !result) return;

  const services = servicePriceCatalog.services
    .filter(({ category }) => category === 'cosmetology')
    .map((service) => ({ ...service, group: classify(service), search: normalize(publicName(service.name)) }));
  const expanded = new Set();
  let active = 'all';

  const render = () => {
    const query = normalize(search.value);
    filters.replaceChildren(
      createFilter({ id: 'all', label: 'Все процедуры' }, services.length, active === 'all'),
      ...groups.map((group) => createFilter(group, services.filter(({ group: id }) => id === group.id).length, active === group.id)),
    );

    const visibleGroups = groups
      .filter((group) => active === 'all' || active === group.id)
      .map((group) => ({
        group,
        services: services.filter((service) => service.group === group.id && (!query || service.search.includes(query))),
      }))
      .filter(({ services: items }) => items.length);

    container.replaceChildren(...visibleGroups.map(({ group, services: items }) => (
      createPriceGroup(group, items, expanded.has(group.id), query)
    )));

    const count = visibleGroups.reduce((sum, { services: items }) => sum + items.length, 0);
    result.textContent = query ? `Найдено: ${count}` : `Показано: ${count} из ${services.length}`;
    result.hidden = false;
  };

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cosmetology-filter]');
    if (!button) return;
    active = button.dataset.cosmetologyFilter;
    render();
  });

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cosmetology-more]');
    if (!button) return;
    const id = button.dataset.cosmetologyMore;
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    render();
    document.querySelector(`[data-cosmetology-group="${id}"]`)?.scrollIntoView({ block: 'start' });
  });

  document.querySelectorAll('[data-cosmetology-shortcut]').forEach((link) => {
    link.addEventListener('click', () => {
      active = link.dataset.cosmetologyShortcut;
      search.value = '';
      render();
    });
  });

  search.addEventListener('input', render);
  render();
}
