document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const headerLine = document.querySelector('.header-line');
  const contact = document.querySelector('.header-contact');

  if (!header || !headerLine) return;

  let toggle = document.querySelector('.mobile-nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'mobile-nav-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '<span></span><span></span><span></span>';
    headerLine.appendChild(toggle);
  }
  toggle.setAttribute('aria-label', 'Открыть меню');
  toggle.setAttribute('aria-expanded', 'false');

  let panel = document.querySelector('.mobile-menu-panel');
  if (!panel) {
    panel = document.createElement('aside');
    panel.className = 'mobile-menu-panel';
    panel.setAttribute('aria-label', 'Мобильное меню');
    panel.innerHTML = `
      <div class="mobile-menu-contact">
        <a class="phone" href="tel:+73952232303">
          <i class="fa-solid fa-phone"></i>
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
            <a href="children.html"><b>Детям</b><span>Педиатрия, справки, вакцинация</span></a>
            <a href="checkups.html"><b>Чекапы</b><span>Комплексные программы диагностики</span></a>
            <a href="gynecology.html"><b>Гинекология</b><span>Прием, диагностика и женское здоровье</span></a>
            <a href="cosmetology.html"><b>Косметология</b><span>Уходовые и аппаратные процедуры</span></a>
            <a href="organizations.html"><b>Организациям</b><span>Медосмотры и корпоративные программы</span></a>
          </div>
        </details>

        <details class="mobile-menu-section">
          <summary>Врачи</summary>
          <div class="mobile-menu-sublist">
            <a href="doctors.html?specialty=gynecology"><b>Гинекологи</b><span>Женское здоровье</span></a>
            <a href="doctors.html?specialty=therapy"><b>Терапевты</b><span>Первичный прием</span></a>
            <a href="doctors.html?specialty=neurology"><b>Неврологи</b><span>Взрослый прием</span></a>
            <a href="doctors.html?specialty=pediatrics"><b>Педиатры</b><span>Для детей</span></a>
            <a href="doctors.html?specialty=diagnostics"><b>Врачи УЗИ</b><span>Диагностика</span></a>
          </div>
        </details>

        <details class="mobile-menu-section">
          <summary>Контакты</summary>
          <div class="mobile-menu-sublist">
            <a href="contacts.html#gavrilova"><b>ул. Гаврилова, 4</b><span>ост. «Филармония»</span></a>
            <a href="contacts.html#lermontova"><b>ул. Лермонтова, 69</b><span>ост. «Лермонтова»</span></a>
          </div>
        </details>

        <a href="prices.html">Цены</a>
        <a href="about.html">О клинике</a>
        <a href="documents.html">Документы</a>
      </nav>
    `;
    document.body.appendChild(panel);
  }

  let closeTimer;

  const setMenuState = (isOpen) => {
    window.clearTimeout(closeTimer);
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');

    if (isOpen) {
      panel.hidden = false;
      document.body.classList.add('mobile-menu-open');
      window.requestAnimationFrame(() => {
        document.body.classList.add('mobile-menu-visible');
      });
      return;
    }

    document.body.classList.remove('mobile-menu-visible');
    panel.querySelectorAll('details[open]').forEach((details) => {
      details.removeAttribute('open');
    });
    closeTimer = window.setTimeout(() => {
      document.body.classList.remove('mobile-menu-open');
      panel.hidden = true;
    }, 360);
  };

  panel.hidden = true;

  toggle.addEventListener('click', () => {
    setMenuState(!document.body.classList.contains('mobile-menu-open'));
  });

  panel.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link && window.matchMedia('(max-width: 900px)').matches) {
      setMenuState(false);
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });

  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 900px)').matches) setMenuState(false);
  });
});
