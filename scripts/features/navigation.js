const MOBILE_BREAKPOINT = '(max-width: 900px)';
const MENU_TRANSITION_MS = 360;

function addDroppersLinks() {
  const servicesMenu = document.querySelector('.main-nav .nav-item:first-child .nav-dropdown');
  if (servicesMenu && !servicesMenu.querySelector('a[href="analyses.html"]')) {
    const link = document.createElement('a');
    link.href = 'analyses.html';
    link.innerHTML = '<b>Анализы</b><span>Лабораторные исследования и цены</span>';

    const childrenLink = servicesMenu.querySelector('a[href="children.html"]');
    servicesMenu.insertBefore(link, childrenLink);
  }
  if (servicesMenu && !servicesMenu.querySelector('a[href="treatment-room.html"]')) {
    const link = document.createElement('a');
    link.href = 'treatment-room.html';
    link.innerHTML = '<b>Процедурный кабинет</b><span>Инъекции, перевязки и забор анализов</span>';

    const childrenLink = servicesMenu.querySelector('a[href="children.html"]');
    servicesMenu.insertBefore(link, childrenLink);
  }
  if (servicesMenu && !servicesMenu.querySelector('a[href="droppers.html"]')) {
    const link = document.createElement('a');
    link.href = 'droppers.html';
    link.innerHTML = '<b>Капельницы</b><span>Инфузионные программы по назначению врача</span>';

    const organizationsLink = servicesMenu.querySelector('a[href="organizations.html"]');
    servicesMenu.insertBefore(link, organizationsLink);
  }

  const footerDirections = document.querySelector('.footer-column[aria-label="Популярные направления"]');
  if (footerDirections && !footerDirections.querySelector('a[href="droppers.html"]')) {
    const link = document.createElement('a');
    link.href = 'droppers.html';
    link.textContent = 'Капельницы';

    const organizationsLink = footerDirections.querySelector('a[href="organizations.html"]');
    footerDirections.insertBefore(link, organizationsLink);
  }
}

const DOCTOR_MENU_ITEMS = [
  ['gynecology', 'Гинекологи', 'Женское здоровье'],
  ['therapy', 'Терапевты', 'Первичный прием'],
  ['cardiology', 'Кардиологи', 'Консультация и ЭКГ'],
  ['gastroenterology', 'Гастроэнтерологи', 'Прием и консультация'],
  ['neurology', 'Неврологи', 'Взрослым и детям'],
  ['dermatology', 'Дерматологи', 'Кожа и здоровье'],
  ['endocrinology', 'Эндокринологи', 'Общий и женский профиль'],
  ['vascular', 'Сосудистые хирурги', 'Первичный и повторный прием'],
  ['pediatrics', 'Педиатры', 'Для детей'],
  ['diagnostics', 'Врачи УЗИ', 'Ультразвуковая диагностика']
];

function normalizeDoctorsMenuLinks() {
  document.querySelectorAll('.main-nav .nav-item:nth-child(2) .nav-dropdown').forEach((doctorsMenu) => {
    const links = DOCTOR_MENU_ITEMS.map(([filter, label, description]) => {
      const link = document.createElement('a');
      link.href = `doctors.html?specialty=${filter}`;
      link.innerHTML = `<b>${label}</b><span>${description}</span>`;
      return link;
    });
    doctorsMenu.replaceChildren(...links);
  });
}

function getOrCreateMenuToggle(headerLine) {
  const existingToggle = document.querySelector('.mobile-nav-toggle');
  if (existingToggle) return existingToggle;

  const toggle = document.createElement('button');
  toggle.className = 'mobile-nav-toggle';
  toggle.type = 'button';
  toggle.innerHTML = '<span></span><span></span><span></span>';
  headerLine.append(toggle);
  return toggle;
}

function getOrCreateMenuPanel() {
  const existingPanel = document.querySelector('.mobile-menu-panel');
  if (existingPanel) return existingPanel;

  const panel = document.createElement('aside');
  panel.className = 'mobile-menu-panel';
  panel.setAttribute('aria-label', 'Мобильное меню');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="mobile-menu-contact">
      <a class="phone" href="tel:+73952232303">
        <i class="fa-solid fa-phone" aria-hidden="true"></i>
        <span>
          <b>+7 (3952) 23-23-03</b>
          <small>Пн-сб: по записи</small>
        </span>
      </a>
      <a class="button button-primary" href="appointment.html">Записаться онлайн</a>
    </div>

    <nav class="mobile-menu-list" aria-label="Основное мобильное меню">
      <details class="mobile-menu-section">
        <summary>Услуги</summary>
        <div class="mobile-menu-sublist">
          <a href="doctors.html"><b>Прием врачей</b><span>Специалисты для взрослых и детей</span></a>
          <a href="diagnostics.html"><b>Диагностика</b><span>УЗИ, анализы и подготовка</span></a>
          <a href="analyses.html"><b>Анализы</b><span>Лабораторные исследования и цены</span></a>
          <a href="treatment-room.html"><b>Процедурный кабинет</b><span>Инъекции, перевязки и забор анализов</span></a>
          <a href="children.html"><b>Детям</b><span>Педиатрия, справки, вакцинация</span></a>
          <a href="checkups.html"><b>Чекапы</b><span>Комплексные программы диагностики</span></a>
          <a href="gynecology.html"><b>Гинекология</b><span>Прием, диагностика и женское здоровье</span></a>
          <a href="cosmetology.html"><b>Косметология</b><span>Уходовые и аппаратные процедуры</span></a>
          <a href="droppers.html"><b>Капельницы</b><span>Инфузионные программы по назначению врача</span></a>
          <a href="organizations.html"><b>Организациям</b><span>Медосмотры и корпоративные программы</span></a>
        </div>
      </details>

      <details class="mobile-menu-section">
        <summary>Врачи</summary>
        <div class="mobile-menu-sublist">
          <a href="doctors.html?specialty=gynecology"><b>Гинекологи</b><span>Женское здоровье</span></a>
          <a href="doctors.html?specialty=therapy"><b>Терапевты</b><span>Первичный прием</span></a>
          <a href="doctors.html?specialty=cardiology"><b>Кардиологи</b><span>Консультация и ЭКГ</span></a>
          <a href="doctors.html?specialty=gastroenterology"><b>Гастроэнтерологи</b><span>Прием и консультация</span></a>
          <a href="doctors.html?specialty=neurology"><b>Неврологи</b><span>Взрослым и детям</span></a>
          <a href="doctors.html?specialty=dermatology"><b>Дерматологи</b><span>Кожа и здоровье</span></a>
          <a href="doctors.html?specialty=endocrinology"><b>Эндокринологи</b><span>Общий и женский профиль</span></a>
          <a href="doctors.html?specialty=vascular"><b>Сосудистые хирурги</b><span>Первичный и повторный прием</span></a>
          <a href="doctors.html?specialty=pediatrics"><b>Педиатры</b><span>Для детей</span></a>
          <a href="doctors.html?specialty=diagnostics"><b>Врачи УЗИ</b><span>Ультразвуковая диагностика</span></a>
        </div>
      </details>

      <details class="mobile-menu-section">
        <summary>Контакты</summary>
        <div class="mobile-menu-sublist">
          <a href="contacts.html#gavrilova"><b>ул. Николая Гаврилова, 4</b><span>ост. «Чкалова»</span></a>
          <a href="contacts.html#lermontova"><b>ул. Лермонтова, 69</b><span>ост. «Жуковского»</span></a>
        </div>
      </details>

      <a href="prices.html">Цены</a>
      <a href="about.html">О клинике</a>
      <a href="diseases.html">Заболевания</a>
      <a href="documents.html">Документы</a>
    </nav>
  `;
  document.body.append(panel);
  return panel;
}

export function initNavigation() {
  addDroppersLinks();
  normalizeDoctorsMenuLinks();

  const headerLine = document.querySelector('.header-line');
  if (!headerLine) return { closeMobileMenu: () => {} };

  const toggle = getOrCreateMenuToggle(headerLine);
  const panel = getOrCreateMenuPanel();
  let closeTimer = 0;

  toggle.setAttribute('aria-label', 'Открыть меню');
  toggle.setAttribute('aria-expanded', 'false');
  panel.hidden = true;

  const setMenuOpen = (isOpen) => {
    window.clearTimeout(closeTimer);
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');

    if (isOpen) {
      panel.hidden = false;
      document.body.classList.add('mobile-menu-open');
      window.requestAnimationFrame(() => document.body.classList.add('mobile-menu-visible'));
      return;
    }

    document.body.classList.remove('mobile-menu-visible');
    panel.querySelectorAll('details[open]').forEach((details) => details.removeAttribute('open'));
    closeTimer = window.setTimeout(() => {
      document.body.classList.remove('mobile-menu-open');
      panel.hidden = true;
    }, MENU_TRANSITION_MS);
  };

  const closeMobileMenu = () => setMenuOpen(false);

  toggle.addEventListener('click', () => {
    setMenuOpen(!document.body.classList.contains('mobile-menu-open'));
  });

  panel.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('a') && window.matchMedia(MOBILE_BREAKPOINT).matches) closeMobileMenu();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  window.addEventListener('resize', () => {
    if (!window.matchMedia(MOBILE_BREAKPOINT).matches) closeMobileMenu();
  });

  return { closeMobileMenu };
}
