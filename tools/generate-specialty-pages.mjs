import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servicePriceCatalog } from '../scripts/data/service-prices.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const currency = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const pages = [
  {
    file: 'therapy.html', category: 'therapy', eyebrow: 'Терапия',
    title: 'Терапевт в Иркутске — запись и цены | Добрый Доктор',
    description: 'Прием терапевта в медицинском центре «Добрый Доктор» в Иркутске. Врач, актуальные цены, филиал и онлайн-запись.',
    h1: 'Прием терапевта в Иркутске',
    lead: 'Первичная и повторная консультация, оформление медицинских справок и санаторно-курортных документов по предварительной записи.',
    doctor: 'Тигунцева Ольга Игоревна', role: 'Кардиолог, терапевт', branch: 'lermontova', branchAddress: 'ул. Лермонтова, 69',
    cardLabel: 'Первичная консультация', cardPrice: '2 800 ₽', cardNote: 'Прием ведется по предварительной записи. Актуальное время подтвердит администратор.',
    relatedHref: 'cardiology.html', relatedLabel: 'Кардиология и ЭКГ',
    reasons: [
      ['Первичный прием', 'Консультация по текущим жалобам и определение дальнейшего маршрута.'],
      ['Повторный прием', 'Обсуждение результатов назначенных исследований и дальнейших действий.'],
      ['Медицинские справки', 'Оформление документов после осмотра и при наличии необходимых данных.'],
      ['Санаторные документы', 'Справка или карта с учетом требований конкретного учреждения.'],
    ],
    rename: { 'Консультация терапевта-кадиолога первичная': 'Консультация терапевта-кардиолога первичная' },
  },
  {
    file: 'cardiology.html', category: 'cardiology', eyebrow: 'Кардиология',
    title: 'Кардиолог в Иркутске — запись и цены | Добрый Доктор',
    description: 'Прием кардиолога и ЭКГ в медицинском центре «Добрый Доктор» в Иркутске. Врач, актуальные цены и онлайн-запись.',
    h1: 'Прием кардиолога в Иркутске',
    lead: 'Первичная и повторная консультация кардиолога, ЭКГ с расшифровкой и запись на прием в филиале на Лермонтова, 69.',
    doctor: 'Тигунцева Ольга Игоревна', role: 'Кардиолог, терапевт', branch: 'lermontova', branchAddress: 'ул. Лермонтова, 69',
    cardLabel: 'Первичная консультация', cardPrice: '2 800 ₽', cardNote: 'Прием ведется по предварительной записи. Актуальное время подтвердит администратор.',
    relatedHref: 'therapy.html', relatedLabel: 'Прием терапевта',
    reasons: [
      ['Первичный прием', 'Консультация врача и определение необходимого объема дальнейшего обследования.'],
      ['Повторный прием', 'Обсуждение результатов и рекомендаций после первичной консультации.'],
      ['ЭКГ', 'В прайсе доступна электрокардиография с расшифровкой.'],
      ['ЭКГ с нагрузкой', 'Отдельная позиция исследования с расшифровкой результата.'],
    ],
  },
  {
    file: 'neurology.html', category: 'neurology', eyebrow: 'Неврология',
    title: 'Невролог в Иркутске — взрослым и детям | Добрый Доктор',
    description: 'Прием невролога для взрослых и детей в медицинском центре «Добрый Доктор» в Иркутске. Врачи, цены и онлайн-запись.',
    h1: 'Прием невролога в Иркутске',
    lead: 'Первичные и повторные консультации невролога для взрослых и детей по предварительной записи.',
    doctor: 'Старшинова Елена Олеговна', role: 'Невролог, детский невролог', branch: 'gavrilova', branchAddress: 'ул. Николая Гаврилова, 4',
    cardLabel: 'Первичная консультация', cardPrice: '2 800–5 500 ₽', cardNote: 'Стоимость зависит от выбранного врача. Администратор уточнит специалиста и время приема.',
    relatedHref: 'children.html', relatedLabel: 'Детское отделение', rowsWithoutDoctor: true,
    reasons: [
      ['Первичный прием', 'Врач уточняет жалобы и определяет дальнейший маршрут обследования.'],
      ['Повторный прием', 'Обсуждение результатов и дальнейших рекомендаций.'],
      ['Взрослым', 'Консультации невролога предусмотрены для взрослых пациентов.'],
      ['Детям', 'Старшинова Елена Олеговна ведет прием по профилю детской неврологии.'],
    ],
  },
  {
    file: 'gastroenterology.html', category: 'gastroenterology', eyebrow: 'Гастроэнтерология',
    title: 'Гастроэнтеролог в Иркутске — запись и цены | Добрый Доктор',
    description: 'Прием гастроэнтеролога и гепатолога в медицинском центре «Добрый Доктор» в Иркутске. Врач, стоимость консультации и запись.',
    h1: 'Прием гастроэнтеролога в Иркутске',
    lead: 'Первичная и повторная консультация гастроэнтеролога и гепатолога в филиале на улице Николая Гаврилова, 4.',
    doctor: 'Петрунько Ирина Леонидовна', role: 'Гастроэнтеролог, гепатолог', branch: 'gavrilova', branchAddress: 'ул. Николая Гаврилова, 4',
    cardLabel: 'Первичная консультация', cardPrice: '4 000 ₽', cardNote: 'Прием ведется по предварительной записи. Актуальное время подтвердит администратор.',
    relatedHref: 'therapy.html', relatedLabel: 'Прием терапевта',
    reasons: [
      ['Первичный прием', 'Консультация и определение дальнейшего маршрута обследования.'],
      ['Повторный прием', 'Обсуждение результатов и дальнейших рекомендаций.'],
      ['Гастроэнтерология', 'Врач принимает по профилю гастроэнтерологии.'],
      ['Гепатология', 'Специализация врача включает консультации по профилю гепатологии.'],
    ],
  },
  {
    file: 'dermatology.html', category: 'dermatology', eyebrow: 'Дерматология',
    title: 'Дерматолог в Иркутске — запись и цены | Добрый Доктор',
    description: 'Консультации дерматолога и дерматовенеролога в медицинском центре «Добрый Доктор» в Иркутске. Врачи, цены и онлайн-запись.',
    h1: 'Прием дерматолога в Иркутске',
    lead: 'Консультации дерматолога и дерматовенеролога, оформление справок и процедуры по медицинским показаниям.',
    heroWithoutDoctor: true, rowsWithoutDoctor: true, dedupe: true,
    cardLabel: 'Первичная консультация', cardPrice: '2 800–3 600 ₽', cardNote: 'Стоимость первичного приема зависит от выбранного специалиста. Актуальное время подтвердит администратор.',
    relatedHref: 'cosmetology.html', relatedLabel: 'Косметология',
    doctors: [
      { doctor: 'Мясникова Александра Валерьевна', role: 'Косметолог, дерматовенеролог, дерматолог', branch: 'gavrilova', branchAddress: 'ул. Николая Гаврилова, 4' },
      { doctor: 'Рудых Наталья Михайловна', role: 'Дерматолог', branch: 'gavrilova', branchAddress: 'ул. Николая Гаврилова, 4' },
      { doctor: 'Асхаева Татьяна Леонидовна', role: 'Дерматолог', branch: 'lermontova', branchAddress: 'ул. Лермонтова, 69' },
    ],
    reasons: [
      ['Первичный прием', 'Осмотр и определение дальнейшего маршрута обследования или лечения.'],
      ['Повторный прием', 'Контроль состояния и обсуждение результатов назначений.'],
      ['Дерматовенерология', 'В прайсе предусмотрены отдельные консультации дерматовенеролога.'],
      ['Процедуры', 'Необходимость и объем процедур определяет врач после консультации.'],
    ],
    rename: {
      'Сравка врача - дерматолога': 'Справка врача-дерматолога',
      'Справка врача - дерматолога': 'Справка врача-дерматолога',
    },
  },
  {
    file: 'endocrinology.html', category: 'endocrinology', eyebrow: 'Эндокринология',
    title: 'Эндокринолог в Иркутске — запись и цены | Добрый Доктор',
    description: 'Прием эндокринолога в медицинском центре «Добрый Доктор» в Иркутске. Врач, стоимость первичной и повторной консультации, онлайн-запись.',
    h1: 'Прием эндокринолога в Иркутске',
    lead: 'Первичная и повторная консультация эндокринолога по предварительной записи в филиале на Лермонтова, 69.',
    doctor: 'Выгода Сима Яковлевна', role: 'Эндокринолог', branch: 'lermontova', branchAddress: 'ул. Лермонтова, 69',
    cardLabel: 'Первичная консультация', cardPrice: '2 800 ₽', cardNote: 'Прием ведется по предварительной записи. Актуальное время подтвердит администратор.',
    relatedHref: 'gynecology.html', relatedLabel: 'Гинекология и гинекологическая эндокринология',
    doctors: [
      { doctor: 'Выгода Сима Яковлевна', role: 'Эндокринолог', branch: 'lermontova', branchAddress: 'ул. Лермонтова, 69' },
      { doctor: 'Степанова Елена Владимировна', role: 'Гинеколог-эндокринолог', branch: 'gavrilova', branchAddress: 'ул. Николая Гаврилова, 4', note: 'Смежный профиль женского здоровья' },
    ],
    reasons: [
      ['Первичный прием', 'Консультация и определение дальнейшего маршрута обследования.'],
      ['Повторный прием', 'Обсуждение результатов и дальнейших рекомендаций.'],
      ['Общий профиль', 'Прием эндокринолога ведет Выгода Сима Яковлевна.'],
      ['Женское здоровье', 'Гинеколог-эндокринолог принимает по отдельному гинекологическому профилю.'],
    ],
  },
  {
    file: 'vascular-surgery.html', category: 'surgery', doctorFilter: 'vascular', eyebrow: 'Сосудистая хирургия',
    title: 'Сосудистый хирург в Иркутске — запись и цены | Добрый Доктор',
    description: 'Прием сосудистого хирурга в медицинском центре «Добрый Доктор» в Иркутске. Первичная и повторная консультации, цены и онлайн-запись.',
    h1: 'Прием сосудистого хирурга в Иркутске',
    lead: 'Первичная и повторная консультации сосудистого хирурга по предварительной записи в филиале на Лермонтова, 69.',
    doctor: 'Новохатько Ольга Ивановна', role: 'Сосудистый хирург', branch: 'lermontova', branchAddress: 'ул. Лермонтова, 69',
    cardLabel: 'Первичная консультация', cardPrice: '3 300 ₽', cardNote: 'Прием ведется по предварительной записи. Актуальное время подтвердит администратор.',
    relatedHref: 'ultrasound.html', relatedLabel: 'УЗИ и диагностика',
    reasons: [
      ['Первичный прием', 'Консультация врача и определение дальнейшего маршрута обследования.'],
      ['Повторный прием', 'Обсуждение результатов и дальнейших рекомендаций.'],
      ['Сосудистая хирургия', 'Прием проводит сосудистый хирург Новохатько Ольга Ивановна.'],
      ['Флебологический профиль', 'В актуальном прайсе консультации обозначены как прием сосудистого хирурга или флеболога.'],
    ],
    rename: {
      'Консультация сосудистого хирурга/флеболога (первично)': 'Консультация сосудистого хирурга/флеболога первичная',
      'Консультация сосудистого хирурга/флеболога повторно': 'Консультация сосудистого хирурга/флеболога повторная',
    },
  },
];

const money = (value) => `${currency.format(value)} ₽`;
const positionWord = (count) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'позиций';
  if (mod10 === 1) return 'позиция';
  if (mod10 >= 2 && mod10 <= 4) return 'позиции';
  return 'позиций';
};

const appointmentQuery = (page, includeDoctor = true) => {
  const parts = [];
  if (page.branch) parts.push(`branch=${page.branch}`);
  if (includeDoctor && page.doctor) parts.push(`doctor=${encodeURIComponent(page.doctor)}`);
  return parts.join('&amp;');
};

const appointmentHref = (query) => query ? `appointment.html?${query}` : 'appointment.html';

function header() {
  return `<header class="site-header"><div class="shell header-line">
    <a class="brand" href="index.html" aria-label="Добрый Доктор"><img src="assets/logo.webp" alt="Добрый Доктор" width="400" height="100" decoding="async" loading="eager"></a>
    <button class="mobile-header-accessibility-toggle" type="button" aria-controls="accessibilityPanel" aria-label="Настройки версии для слабовидящих" aria-expanded="false" aria-pressed="false" title="Версия для слабовидящих"><svg class="icon-svg" aria-hidden="true" focusable="false" viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1-288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"></path></svg></button>
    <button class="mobile-nav-toggle" type="button" aria-label="Открыть меню" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="main-nav" aria-label="Основная навигация">
      <div class="nav-item"><a href="services.html">Услуги</a><div class="nav-dropdown"><a href="doctors.html"><b>Прием врачей</b><span>Специалисты для взрослых и детей</span></a><a href="diagnostics.html"><b>Диагностика</b><span>УЗИ, анализы и подготовка</span></a><a href="children.html"><b>Детям</b><span>Педиатрия, справки, вакцинация</span></a><a href="checkups.html"><b>Чекапы</b><span>Комплексные программы диагностики</span></a><a href="gynecology.html"><b>Гинекология</b><span>Прием, диагностика и женское здоровье</span></a><a href="cosmetology.html"><b>Косметология</b><span>Уходовые и аппаратные процедуры</span></a><a href="organizations.html"><b>Организациям</b><span>Медосмотры и корпоративные программы</span></a></div></div>
      <div class="nav-item"><a class="is-active" href="doctors.html">Врачи</a><div class="nav-dropdown nav-dropdown-compact"><a href="doctors.html?specialty=gynecology"><b>Гинекологи</b><span>Женское здоровье</span></a><a href="doctors.html?specialty=therapy"><b>Терапевты</b><span>Первичный прием</span></a><a href="doctors.html?specialty=cardiology"><b>Кардиологи</b><span>Консультация и ЭКГ</span></a><a href="doctors.html?specialty=gastroenterology"><b>Гастроэнтерологи</b><span>Прием и консультация</span></a><a href="doctors.html?specialty=neurology"><b>Неврологи</b><span>Взрослым и детям</span></a><a href="doctors.html?specialty=dermatology"><b>Дерматологи</b><span>Кожа и здоровье</span></a><a href="doctors.html?specialty=endocrinology"><b>Эндокринологи</b><span>Общий и женский профиль</span></a><a href="doctors.html?specialty=vascular"><b>Сосудистые хирурги</b><span>Первичный и повторный прием</span></a><a href="doctors.html?specialty=pediatrics"><b>Педиатры</b><span>Для детей</span></a><a href="doctors.html?specialty=diagnostics"><b>Врачи УЗИ</b><span>Ультразвуковая диагностика</span></a></div></div>
      <div class="nav-item"><a href="contacts.html">Контакты</a><div class="nav-dropdown nav-dropdown-contacts"><a href="contacts.html#gavrilova"><b>ул. Николая Гаврилова, 4</b><span>ост. «Чкалова»</span></a><a href="contacts.html#lermontova"><b>ул. Лермонтова, 69</b><span>ост. «Жуковского»</span></a></div></div>
      <a href="#price">Цены</a><a href="about.html">О клинике</a><a href="diseases.html">Заболевания</a><a href="documents.html">Документы</a>
    </nav>
    <div class="header-contact"><a class="phone" href="tel:+73952232303"><i class="fa-solid fa-phone"></i><span><b>+7 (3952) 23-23-03</b><small>Пн-сб: по записи</small></span></a><a class="button button-primary" href="appointment.html">Записаться онлайн</a><button class="accessibility-toggle" type="button" aria-controls="accessibilityPanel" aria-label="Включить версию для слабовидящих" aria-expanded="false" aria-pressed="false" title="Версия для слабовидящих"><svg class="icon-svg" aria-hidden="true" focusable="false" viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1-288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"></path></svg></button></div>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer" id="site-footer"><div class="shell">
    <div class="footer-contact-bar"><a class="footer-logo" href="index.html" aria-label="Добрый Доктор — на главную"><img src="assets/logo.webp" alt="Добрый Доктор" width="400" height="100" decoding="async" loading="lazy"><span>Медицинский центр<br>в Иркутске</span></a><div class="footer-contact-primary"><a class="footer-phone" href="tel:+73952232303">+7 (3952) 23-23-03</a><a class="footer-question" href="mailto:doktor.dobry2016@yandex.ru?subject=Вопрос%20администратору">Задать вопрос администратору</a></div><a class="footer-cta" href="appointment.html"><span>Записаться онлайн</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>
    <div class="footer-nav-grid"><nav class="footer-column" aria-label="Услуги и врачи"><b>Услуги и врачи</b><a href="services.html">Все услуги</a><a href="doctors.html">Врачи</a><a href="therapy.html">Терапевт</a><a href="cardiology.html">Кардиолог</a><a href="diagnostics.html">Диагностика</a><a href="prices.html">Цены</a></nav><nav class="footer-column" aria-label="Пациентам"><b>Пациентам</b><a href="appointment.html">Записаться на прием</a><a href="children.html">Детское отделение</a><a href="checkups.html">Чекапы</a><a href="cosmetology.html">Косметология</a><a href="documents.html">Документы и лицензии</a></nav><nav class="footer-column" aria-label="О медицинском центре"><b>О клинике</b><a href="about.html">О медицинском центре</a><a href="contacts.html">Контакты</a><a href="organizations.html">Организациям</a><a href="gynecology.html">Гинекология</a><a href="mailto:doktor.dobry2016@yandex.ru">Написать в клинику</a></nav><div class="footer-column footer-branches"><b>Филиалы</b><a href="contacts.html#gavrilova"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span><strong>ул. Николая Гаврилова, 4</strong><small>ост. «Чкалова»</small></span></a><a href="contacts.html#lermontova"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span><strong>ул. Лермонтова, 69</strong><small>ост. «Жуковского»</small></span></a><p>Прием ведется по предварительной записи.</p></div></div>
    <div class="footer-meta"><div class="footer-meta-license"><span>Лицензия ЛО-38-01-003181 от 20.12.2016</span><span>© 2026 Медицинский центр «Добрый Доктор»</span></div><div class="footer-meta-links"><a href="documents.html">Правовая информация и документы</a><a href="contacts.html">Адреса и режим работы</a></div><div class="footer-meta-contact"><span>Связаться с клиникой</span><a href="mailto:doktor.dobry2016@yandex.ru">doktor.dobry2016@yandex.ru</a></div></div>
  </div><div class="footer-disclaimer">Имеются противопоказания. Необходима консультация специалиста</div></footer>`;
}

function render(page) {
  const sourceServices = servicePriceCatalog.services.filter(({ category }) => category === page.category);
  const normalizedServices = sourceServices.map(({ name, price }) => ({ name: page.rename?.[name] || name, price }));
  const services = page.dedupe
    ? [...new Map(normalizedServices.map((service) => [`${service.name}|${service.price}`, service])).values()]
    : normalizedServices;
  const heroQuery = appointmentQuery(page, !page.heroWithoutDoctor);
  const rowQuery = appointmentQuery(page, !page.rowsWithoutDoctor);
  const rows = services.map(({ name, price }) => `<a href="${appointmentHref(rowQuery)}"><span>${name}</span><b>${price ? money(price) : 'Уточнить'}</b></a>`).join('');
  const icons = ['fa-user-doctor', 'fa-clipboard-check', 'fa-file-medical', 'fa-heart-pulse'];
  const reasons = page.reasons.map(([title, text], index) => `<div><i class="fa-solid ${icons[index]}"></i><b>${title}</b><span>${text}</span></div>`).join('');
  const doctors = page.doctors || [{ doctor: page.doctor, role: page.role, branch: page.branch, branchAddress: page.branchAddress }];
  const doctorCards = doctors.map((doctor) => {
    const query = appointmentQuery(doctor);
    return `<article class="specialty-doctor-card"><div><p class="eyebrow">${doctor.note || 'Специалист'}</p><h3>${doctor.doctor}</h3><p>${doctor.role}. Прием ведется по предварительной записи.</p><div class="doctor-meta"><span><i class="fa-solid fa-location-dot"></i> ${doctor.branchAddress}</span><span><i class="fa-regular fa-clock"></i> по записи</span></div></div><div class="specialty-doctor-actions"><a class="button button-primary" href="${appointmentHref(query)}">Записаться</a></div></article>`;
  }).join('');
  const doctorSection = doctors.length > 1
    ? `<section class="direction-section" id="doctor" data-reveal><div class="group-head"><div><p class="eyebrow">Команда направления</p><h2>Врачи</h2></div><a class="text-link" href="doctors.html?specialty=${page.doctorFilter || page.category}">Все врачи направления</a></div><div class="specialty-doctor-list">${doctorCards}</div></section>`
    : `<section class="direction-section specialty-doctor-card" id="doctor" data-reveal><div><p class="eyebrow">Специалист</p><h2>${page.doctor}</h2><p>${page.role}. Прием ведется по предварительной записи.</p><div class="doctor-meta"><span><i class="fa-solid fa-location-dot"></i> ${page.branchAddress}</span><span><i class="fa-regular fa-clock"></i> по записи</span></div></div><div class="specialty-doctor-actions"><a class="button button-primary" href="${appointmentHref(heroQuery)}">Записаться</a><a class="text-link" href="doctors.html?specialty=${page.doctorFilter || page.category}">Все врачи направления</a></div></section>`;
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${page.title}</title><meta name="description" content="${page.description}"><link rel="icon" type="image/webp" href="assets/logo.webp"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="styles/pages/${path.basename(page.file, '.html')}.css?v=release3"><link rel="stylesheet" href="styles/dist/core-responsive.css?v=release3"><link rel="stylesheet" href="styles/pages/${path.basename(page.file, '.html')}-overrides.css?v=release3"><link rel="stylesheet" href="styles/dist/core-accessibility.css?v=release3"></head><body>
${header()}<main>
  <section class="service-detail-hero specialty-hero"><div class="shell service-detail-grid"><div data-reveal><a class="back-link" href="doctors.html"><i class="fa-solid fa-arrow-left"></i> Все врачи</a><p class="eyebrow">${page.eyebrow}</p><h1>${page.h1}</h1><p class="hero-lead">${page.lead}</p><div class="hero-actions"><a class="button button-primary" href="${appointmentHref(heroQuery)}">Записаться на прием</a><a class="button button-secondary" href="tel:+73952232303">Позвонить</a></div></div><aside class="detail-appointment-card" id="price" data-reveal><span class="small-label">${page.cardLabel}</span><b>${page.cardPrice}</b><p>${page.cardNote}</p><a class="button button-primary" href="${appointmentHref(heroQuery)}">Оставить заявку</a></aside></div></section>
  <section class="detail-body"><div class="shell detail-layout"><aside class="direction-nav" aria-label="Навигация по странице"><a class="active" href="#services">Услуги и цены</a><a href="#doctor">Врач</a><a href="#appointment-path">Как проходит прием</a><a href="#prepare">Перед приемом</a></aside><div class="direction-content">
    <section class="direction-section" id="services" data-reveal><div class="group-head"><div><p class="eyebrow">Актуальный прайс</p><h2>Услуги и стоимость</h2></div><span class="document-count">${services.length} ${positionWord(services.length)}</span></div><div class="price-table specialty-price-list">${rows}</div><p class="price-footnote">Стоимость указана по актуальному прайсу. Необходимость дополнительных исследований определяет врач.</p></section>
    ${doctorSection}
    <section class="direction-section" id="appointment-path" data-reveal><div class="group-head"><div><p class="eyebrow">Прием</p><h2>Что будет на консультации</h2></div></div><div class="reason-grid">${reasons}</div></section>
    <section class="direction-section" id="prepare" data-reveal><div class="group-head"><div><p class="eyebrow">Перед приемом</p><h2>Что можно взять с собой</h2></div></div><div class="check-list"><span><i class="fa-solid fa-check"></i> Результаты прошлых обследований и выписки, если они есть.</span><span><i class="fa-solid fa-check"></i> Список принимаемых препаратов или их упаковки.</span><span><i class="fa-solid fa-check"></i> Список вопросов, которые хотите обсудить с врачом.</span></div><p class="price-footnote">Требования к отдельным исследованиям уточняйте при записи.</p></section>
    <section class="direction-section specialty-related" data-reveal><div><p class="eyebrow">Смежное направление</p><h2>${page.relatedLabel}</h2></div><a class="button button-secondary" href="${page.relatedHref}">Перейти к странице</a></section>
  </div></div></section>
  <section class="service-cta"><div class="shell service-cta-grid"><div><p class="eyebrow">Запись</p><h2>Выберите удобное время вместе с администратором</h2></div><div class="service-cta-actions"><a class="button button-primary" href="${appointmentHref(heroQuery)}">Записаться онлайн</a><a class="button button-secondary" href="tel:+73952232303">Позвонить</a></div></div><div class="shell legal-note light">Имеются противопоказания. Необходима консультация специалиста.</div></section>
</main>${footer()}<script defer src="scripts/data/icon-definitions.js?v=release4"></script><script defer src="scripts/core/icons.js?v=release4"></script><script defer src="scripts/features/accessibility.js?v=release4"></script><script type="module" src="site.js?v=release4"></script></body></html>\n`;
}

for (const page of pages) {
  await fs.writeFile(path.join(root, page.file), render(page), 'utf8');
  console.log(`Generated ${page.file}`);
}
