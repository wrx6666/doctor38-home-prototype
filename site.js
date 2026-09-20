document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const headerLine = document.querySelector('.header-line');
  const contact = document.querySelector('.header-contact');

  if (!header || !headerLine) return;

  const desktopServicesMenu = document.querySelector('.main-nav .nav-item:first-child .nav-dropdown');
  if (desktopServicesMenu && !desktopServicesMenu.querySelector('a[href="droppers.html"]')) {
    const droppersLink = document.createElement('a');
    droppersLink.href = 'droppers.html';
    droppersLink.innerHTML = '<b>Капельницы</b><span>Инфузионные программы по назначению врача</span>';
    const organizationsLink = desktopServicesMenu.querySelector('a[href="organizations.html"]');
    desktopServicesMenu.insertBefore(droppersLink, organizationsLink || null);
  }

  const popularDirections = document.querySelector('.footer-column[aria-label="Популярные направления"]');
  if (popularDirections && !popularDirections.querySelector('a[href="droppers.html"]')) {
    const footerDroppersLink = document.createElement('a');
    footerDroppersLink.href = 'droppers.html';
    footerDroppersLink.textContent = 'Капельницы';
    const footerOrganizationsLink = popularDirections.querySelector('a[href="organizations.html"]');
    popularDirections.insertBefore(footerDroppersLink, footerOrganizationsLink || null);
  }

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
            <a href="droppers.html"><b>Капельницы</b><span>Инфузионные программы по назначению врача</span></a>
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

  const storyCards = Array.from(document.querySelectorAll('[data-story]'));
  const storyViewer = document.querySelector('.story-viewer');

  if (storyCards.length && storyViewer) {
    const storyImage = storyViewer.querySelector('.story-viewer-media img');
    const storyTitle = storyViewer.querySelector('#story-viewer-title');
    const storyText = storyViewer.querySelector('.story-viewer-text');
    const storyCount = storyViewer.querySelector('.story-viewer-count');
    const storyProgress = storyViewer.querySelector('.story-viewer-progress');
    const previousButton = storyViewer.querySelector('.story-viewer-prev');
    const nextButton = storyViewer.querySelector('.story-viewer-next');
    const closeButton = storyViewer.querySelector('.story-viewer-close');
    let currentStory = 0;
    let lastTrigger = null;
    let touchStartX = 0;

    storyProgress.innerHTML = storyCards.map(() => '<span></span>').join('');

    const updateStory = (index, animate = true) => {
      currentStory = Math.max(0, Math.min(index, storyCards.length - 1));
      const card = storyCards[currentStory];

      if (animate) {
        storyViewer.classList.remove('is-switching');
        void storyViewer.offsetWidth;
        storyViewer.classList.add('is-switching');
      }

      storyImage.src = card.dataset.storyImage;
      storyImage.alt = card.querySelector('img').alt;
      storyTitle.textContent = card.dataset.storyTitle;
      storyText.textContent = card.dataset.storyCopy;
      storyCount.textContent = `${String(currentStory + 1).padStart(2, '0')} / ${String(storyCards.length).padStart(2, '0')}`;
      storyProgress.querySelectorAll('span').forEach((item, itemIndex) => {
        item.classList.toggle('is-complete', itemIndex < currentStory);
        item.classList.toggle('is-current', itemIndex === currentStory);
      });
      previousButton.disabled = currentStory === 0;
      nextButton.disabled = currentStory === storyCards.length - 1;
    };

    const openStory = (index, trigger) => {
      lastTrigger = trigger;
      updateStory(index, false);
      document.body.classList.add('story-viewer-open');

      if (typeof storyViewer.showModal === 'function') {
        storyViewer.showModal();
      } else {
        storyViewer.setAttribute('open', '');
      }

      closeButton.focus();
    };

    const closeStory = () => {
      document.body.classList.remove('story-viewer-open');
      if (typeof storyViewer.close === 'function') storyViewer.close();
      else storyViewer.removeAttribute('open');
      if (lastTrigger) lastTrigger.focus();
    };

    storyCards.forEach((card, index) => {
      card.addEventListener('click', () => openStory(index, card));
    });

    previousButton.addEventListener('click', () => updateStory(currentStory - 1));
    nextButton.addEventListener('click', () => updateStory(currentStory + 1));
    closeButton.addEventListener('click', closeStory);

    storyViewer.addEventListener('click', (event) => {
      if (event.target === storyViewer) closeStory();
    });

    storyViewer.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeStory();
    });

    storyViewer.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' && currentStory > 0) updateStory(currentStory - 1);
      if (event.key === 'ArrowRight' && currentStory < storyCards.length - 1) updateStory(currentStory + 1);
    });

    storyViewer.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    storyViewer.addEventListener('touchend', (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (distance > 64 && currentStory > 0) updateStory(currentStory - 1);
      if (distance < -64 && currentStory < storyCards.length - 1) updateStory(currentStory + 1);
    }, { passive: true });
  }
});
