import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servicePriceCatalog } from '../scripts/data/service-prices.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceHtml = await fs.readFile(path.join(root, 'ultrasound.html'), 'utf8');
const header = sourceHtml.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
const footer = sourceHtml.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0];
if (!header || !footer) throw new Error('Не удалось получить общие шапку и подвал из ultrasound.html');

const pages = [
  {
    file: 'ultrasound-abdomen.html',
    title: 'УЗИ брюшной полости в Иркутске — цены и запись | Добрый Доктор',
    description: 'УЗИ органов брюшной полости в медицинском центре «Добрый Доктор» в Иркутске: актуальные цены, подготовка и онлайн-запись.',
    eyebrow: 'УЗИ внутренних органов',
    h1: 'УЗИ брюшной полости в Иркутске',
    lead: 'Исследования органов брюшной полости и отдельных органов по актуальному прайсу медицинского центра.',
    pattern: /брюшной полости|гепатобилиарной зоны|узи печени|желчного пузыря|узи селезёнки|узи поджелудочной/i,
    preparation: 'Часть исследований брюшной полости проводится натощак. Точные условия зависят от выбранной позиции — администратор сообщит их при записи.',
    facts: [
      ['Несколько форматов', 'В прайсе есть комплексное исследование и отдельные исследования органов.'],
      ['Актуальные цены', 'Стоимость показана непосредственно из рабочего каталога клиники.'],
      ['Подготовка', 'Для части исследований в названии прайса прямо указано проведение натощак.'],
      ['По записи', 'Администратор уточнит вид исследования, филиал и удобное время.'],
    ],
  },
  {
    file: 'ultrasound-pelvis.html',
    title: 'УЗИ малого таза в Иркутске — цены и запись | Добрый Доктор',
    description: 'УЗИ органов малого таза в медицинском центре «Добрый Доктор» в Иркутске: виды исследований, актуальные цены, подготовка и запись.',
    eyebrow: 'Гинекологическое УЗИ',
    h1: 'УЗИ малого таза в Иркутске',
    lead: 'УЗИ матки и придатков, фолликулометрия и предусмотренные прайсом варианты исследования.',
    pattern: /матки и придатков|малого таза|фолликулометр/i,
    preparation: 'Подготовка зависит от способа исследования. Для отдельных позиций может потребоваться наполненный мочевой пузырь — уточните условия при записи.',
    facts: [
      ['Варианты исследования', 'В прайсе предусмотрены трансвагинальный, трансректальный и трансабдоминальный форматы.'],
      ['Фолликулометрия', 'Первичное и повторное исследования вынесены в отдельные позиции прайса.'],
      ['Для подростков', 'Есть отдельная позиция для девочек с 12 лет с указанным способом подготовки.'],
      ['По записи', 'Администратор уточнит подходящую позицию, филиал и время.'],
    ],
  },
  {
    file: 'ultrasound-kidneys.html',
    title: 'УЗИ почек в Иркутске — цены и запись | Добрый Доктор',
    description: 'УЗИ почек и мочевыделительной системы в медицинском центре «Добрый Доктор» в Иркутске: актуальные цены и онлайн-запись.',
    eyebrow: 'Мочевыделительная система',
    h1: 'УЗИ почек в Иркутске',
    lead: 'УЗИ почек, надпочечников и исследования мочевого пузыря по актуальному прайсу клиники.',
    pattern: /узи почек|надпочечников|мочевого пузыря|брюшной полости \+ почек/i,
    preparation: 'Условия подготовки зависят от состава исследования. Администратор уточнит, требуется ли наполненный мочевой пузырь и какие документы взять с собой.',
    facts: [
      ['Почки', 'В каталоге есть самостоятельная позиция УЗИ почек.'],
      ['Комплекс', 'Отдельно указано комплексное исследование брюшной полости и почек.'],
      ['Мочевой пузырь', 'Доступны позиции с определением остаточной мочи и без него.'],
      ['По записи', 'Администратор уточнит исследование, филиал и подготовку.'],
    ],
  },
  {
    file: 'echocardiography.html',
    title: 'УЗИ сердца в Иркутске — ЭхоКГ, цена и запись | Добрый Доктор',
    description: 'Эхокардиография и УЗИ сердца в медицинском центре «Добрый Доктор» в Иркутске: актуальная цена и онлайн-запись.',
    eyebrow: 'Эхокардиография',
    h1: 'УЗИ сердца в Иркутске',
    lead: 'Эхокардиография (ЭхоКГ) по предварительной записи в медицинском центре «Добрый Доктор».',
    pattern: /узи сердца|эхокг/i,
    preparation: 'Специальные условия и возможность проведения исследования в выбранном филиале уточните у администратора при записи.',
    facts: [
      ['Название услуги', 'В актуальном прайсе исследование указано как «УЗИ сердца ЭХОКГ».'],
      ['Стоимость', 'На странице показана цена из действующего рабочего каталога.'],
      ['Специалисты УЗИ', 'В направлении работают врачи ультразвуковой диагностики двух филиалов.'],
      ['По записи', 'Администратор подтвердит врача, филиал и доступное время.'],
    ],
  },
];

const landingLinks = [
  ['ultrasound-abdomen.html', 'УЗИ брюшной полости'],
  ['ultrasound-pelvis.html', 'УЗИ малого таза'],
  ['ultrasound-kidneys.html', 'УЗИ почек'],
  ['echocardiography.html', 'УЗИ сердца / ЭхоКГ'],
];

const formatPrice = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const cleanServiceName = (name) => String(name)
  .replace(/\s+/g, ' ')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')')
  .replace(/проводиться/gi, 'проводится')
  .replace(/на тощак/gi, 'натощак')
  .trim();

const positionWord = (count) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'позиций';
  if (mod10 === 1) return 'позиция';
  if (mod10 >= 2 && mod10 <= 4) return 'позиции';
  return 'позиций';
};

function renderPage(page) {
  const services = servicePriceCatalog.services
    .filter(({ category, name }) => category === 'ultrasound' && page.pattern.test(name))
    .map(({ name, price }) => ({ name: cleanServiceName(name), price }));
  if (!services.length) throw new Error(`Нет услуг для ${page.file}`);

  const minimumPrice = Math.min(...services.map(({ price }) => price).filter((price) => price > 0));
  const priceRows = services.map(({ name, price }) => `
            <a href="appointment.html"><span>${escapeHtml(name)}</span><b>${price > 0 ? `${formatPrice.format(price)} ₽` : 'Уточнить'}</b></a>`).join('');
  const factIcons = ['fa-list-check', 'fa-tags', 'fa-clipboard-check', 'fa-calendar-check'];
  const factRows = page.facts.map(([title, text], index) => `
              <div><i class="fa-solid ${factIcons[index]}"></i><b>${escapeHtml(title)}</b><span>${escapeHtml(text)}</span></div>`).join('');
  const relatedLinks = landingLinks.map(([href, label]) => href === page.file
    ? `<span aria-current="page">${label}</span>`
    : `<a href="${href}">${label}</a>`).join('');
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: page.h1,
    description: page.description,
    procedureType: 'DiagnosticProcedure',
    areaServed: { '@type': 'City', name: 'Иркутск' },
    provider: {
      '@type': 'MedicalClinic',
      name: 'Добрый Доктор',
      telephone: '+7 (3952) 23-23-03',
      url: 'https://doctor38.ru/',
    },
  });

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <link rel="canonical" href="https://doctor38.ru/${page.file}">
  <link rel="icon" type="image/webp" href="assets/logo.webp">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/pages/${path.basename(page.file, '.html')}.css?v=release3">
  <link rel="stylesheet" href="styles/dist/core-responsive.css?v=release3">
  <link rel="stylesheet" href="styles/pages/${path.basename(page.file, '.html')}-overrides.css?v=release3">
  <link rel="stylesheet" href="styles/dist/core-accessibility.css?v=release3">
  <script type="application/ld+json">${schema}</script>
</head>
<body>
${header}
<main>
  <section class="service-detail-hero specialty-hero">
    <div class="shell service-detail-grid">
      <div data-reveal>
        <a class="back-link" href="ultrasound.html"><i class="fa-solid fa-arrow-left"></i> Все виды УЗИ</a>
        <p class="eyebrow">${page.eyebrow}</p>
        <h1>${page.h1}</h1>
        <p class="hero-lead">${page.lead}</p>
        <div class="hero-actions"><a class="button button-primary" href="appointment.html">Записаться на УЗИ</a><a class="button button-secondary" href="tel:+73952232303">Позвонить</a></div>
      </div>
      <aside class="detail-appointment-card" id="price" data-reveal>
        <span class="small-label">Стоимость исследования</span>
        <b>от ${formatPrice.format(minimumPrice)} ₽</b>
        <p>${services.length} ${positionWord(services.length)} в актуальном прайсе. Вид исследования и подготовку уточнит администратор.</p>
        <a class="button button-primary" href="appointment.html">Оставить заявку</a>
      </aside>
    </div>
  </section>

  <section class="detail-body">
    <div class="shell detail-layout">
      <aside class="direction-nav" aria-label="Навигация по странице">
        <a class="active" href="#services">Цены</a><a href="#about">Об исследовании</a><a href="#prepare">Подготовка</a><a href="#doctors">Специалисты</a><a href="#other-ultrasound">Другие виды УЗИ</a>
      </aside>
      <div class="direction-content">
        <section class="direction-section" id="services" data-reveal>
          <div class="group-head"><div><p class="eyebrow">Актуальный прайс</p><h2>Виды исследований и цены</h2></div><span class="document-count">${services.length} ${positionWord(services.length)}</span></div>
          <div class="price-table specialty-price-list">${priceRows}
          </div>
          <p class="price-footnote">Цены взяты из актуального прайса клиники. Итоговую услугу и подготовку уточняйте при записи.</p>
        </section>

        <section class="direction-section" id="about" data-reveal>
          <div class="group-head"><div><p class="eyebrow">По данным клиники</p><h2>Что важно знать перед записью</h2></div></div>
          <div class="reason-grid">${factRows}
          </div>
        </section>

        <section class="direction-section" id="prepare" data-reveal>
          <div class="group-head"><div><p class="eyebrow">Подготовка</p><h2>Условия зависят от исследования</h2></div></div>
          <div class="check-list"><span><i class="fa-solid fa-check"></i> ${escapeHtml(page.preparation)}</span><span><i class="fa-solid fa-check"></i> Возьмите результаты предыдущих исследований, если они есть.</span><span><i class="fa-solid fa-check"></i> Сообщите администратору точное название исследования из назначения врача.</span></div>
          <p class="price-footnote">Медицинские рекомендации на странице необходимо подтвердить ответственным специалистом клиники перед финальным релизом.</p>
        </section>

        <section class="direction-section" id="doctors" data-reveal>
          <div class="group-head"><div><p class="eyebrow">Врачи УЗИ</p><h2>Специалисты направления</h2></div><a class="text-link" href="doctors.html?specialty=diagnostics">Все врачи УЗИ</a></div>
          <div class="specialty-doctor-list">
            <article class="specialty-doctor-card"><div><h3>Мясников Владимир Геннадьевич</h3><p>Врач ультразвуковой диагностики. Администратор уточнит доступные исследования.</p><div class="doctor-meta"><span><i class="fa-solid fa-location-dot"></i> ул. Николая Гаврилова, 4</span></div></div><div class="specialty-doctor-actions"><a class="button button-primary" href="appointment.html?branch=gavrilova&amp;doctor=${encodeURIComponent('Мясников Владимир Геннадьевич')}">Записаться</a></div></article>
            <article class="specialty-doctor-card"><div><h3>Пиксаева Ирина Викторовна</h3><p>Врач ультразвуковой диагностики. Администратор уточнит доступные исследования.</p><div class="doctor-meta"><span><i class="fa-solid fa-location-dot"></i> ул. Лермонтова, 69</span></div></div><div class="specialty-doctor-actions"><a class="button button-primary" href="appointment.html?branch=lermontova&amp;doctor=${encodeURIComponent('Пиксаева Ирина Викторовна')}">Записаться</a></div></article>
          </div>
        </section>

        <section class="direction-section" id="other-ultrasound" data-reveal>
          <div class="group-head"><div><p class="eyebrow">Навигация</p><h2>Другие популярные виды УЗИ</h2></div><a class="text-link" href="ultrasound.html">Полный каталог</a></div>
          <div class="ultrasound-page-links">${relatedLinks}</div>
        </section>
      </div>
    </div>
  </section>

  <section class="service-cta"><div class="shell service-cta-grid"><div><p class="eyebrow">Запись</p><h2>Администратор уточнит исследование, филиал и время</h2></div><div class="service-cta-actions"><a class="button button-primary" href="appointment.html">Записаться онлайн</a><a class="button button-secondary" href="tel:+73952232303">Позвонить</a></div></div><div class="shell legal-note light">Имеются противопоказания. Необходима консультация специалиста.</div></section>
</main>
${footer}
<script defer src="scripts/data/icon-definitions.js?v=release4"></script>
<script defer src="scripts/core/icons.js?v=release4"></script>
<script defer src="scripts/features/accessibility.js?v=release4"></script>
<script type="module" src="site.js?v=release4"></script>
</body>
</html>
`;
}

for (const page of pages) {
  await fs.writeFile(path.join(root, page.file), renderPage(page), 'utf8');
  console.log(`Generated ${page.file}`);
}
