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

  const accessibilityDefaults = {
    enabled: false,
    panelOpen: false,
    font: 'normal',
    theme: 'light',
    spacing: 'normal',
    images: 'show',
    speech: 'off'
  };
  const accessibilityStorageKey = 'doctor38-accessibility';
  let accessibilitySettings = { ...accessibilityDefaults };

  try {
    const savedSettings = JSON.parse(window.localStorage.getItem(accessibilityStorageKey) || 'null');
    if (savedSettings && typeof savedSettings === 'object') {
      accessibilitySettings = { ...accessibilityDefaults, ...savedSettings };
    }
  } catch (error) {
    accessibilitySettings = { ...accessibilityDefaults };
  }

  const accessibilityOptions = {
    font: ['normal', 'large', 'xlarge'],
    theme: ['light', 'contrast', 'blue', 'beige', 'brown'],
    spacing: ['normal', 'wide'],
    images: ['show', 'hide', 'grayscale'],
    speech: ['off', 'on']
  };
  Object.entries(accessibilityOptions).forEach(([setting, values]) => {
    if (!values.includes(accessibilitySettings[setting])) accessibilitySettings[setting] = accessibilityDefaults[setting];
  });

  const accessibilityToggle = document.createElement('button');
  accessibilityToggle.className = 'accessibility-toggle';
  accessibilityToggle.type = 'button';
  accessibilityToggle.setAttribute('aria-controls', 'accessibilityPanel');
  accessibilityToggle.setAttribute('aria-expanded', 'false');
  accessibilityToggle.setAttribute('aria-label', 'Включить версию для слабовидящих');
  accessibilityToggle.title = 'Версия для слабовидящих';
  accessibilityToggle.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
  if (contact) contact.appendChild(accessibilityToggle);

  const accessibilityPanel = document.createElement('section');
  accessibilityPanel.className = 'accessibility-panel';
  accessibilityPanel.id = 'accessibilityPanel';
  accessibilityPanel.setAttribute('aria-label', 'Настройки версии для слабовидящих');
  accessibilityPanel.hidden = true;
  accessibilityPanel.innerHTML = `
    <div class="shell accessibility-panel-inner">
      <div class="accessibility-group accessibility-font-controls" role="group" aria-label="Размер шрифта">
        <span>Размер шрифта</span>
        <div class="accessibility-control-row">
          <button type="button" data-a11y-action="font-decrease" aria-label="Уменьшить шрифт">A−</button>
          <button type="button" data-a11y-action="font-increase" aria-label="Увеличить шрифт">A+</button>
        </div>
      </div>
      <div class="accessibility-group" role="group" aria-label="Цветовая схема">
        <span>Цвета сайта</span>
        <div class="accessibility-control-row accessibility-theme-controls">
          <button class="accessibility-swatch-light" type="button" data-a11y-setting="theme" data-a11y-value="light" aria-label="Черный текст на белом фоне">Ц</button>
          <button class="accessibility-swatch-dark" type="button" data-a11y-setting="theme" data-a11y-value="contrast" aria-label="Белый текст на черном фоне">Ц</button>
          <button class="accessibility-swatch-blue" type="button" data-a11y-setting="theme" data-a11y-value="blue" aria-label="Темный текст на голубом фоне">Ц</button>
          <button class="accessibility-swatch-beige" type="button" data-a11y-setting="theme" data-a11y-value="beige" aria-label="Темный текст на бежевом фоне">Ц</button>
          <button class="accessibility-swatch-brown" type="button" data-a11y-setting="theme" data-a11y-value="brown" aria-label="Светло-зеленый текст на коричневом фоне">Ц</button>
        </div>
      </div>
      <div class="accessibility-group" role="group" aria-label="Отображение изображений">
        <span>Изображения</span>
        <div class="accessibility-control-row">
          <button type="button" data-a11y-setting="images" data-a11y-value="show" aria-label="Показывать изображения"><i class="fa-regular fa-image" aria-hidden="true"></i></button>
          <button type="button" data-a11y-setting="images" data-a11y-value="hide" aria-label="Скрыть изображения"><i class="fa-solid fa-circle-minus" aria-hidden="true"></i></button>
          <button type="button" data-a11y-setting="images" data-a11y-value="grayscale" aria-label="Черно-белые изображения"><i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="accessibility-group" role="group" aria-label="Синтез речи">
        <span>Синтез речи</span>
        <div class="accessibility-control-row">
          <button type="button" data-a11y-setting="speech" data-a11y-value="off" aria-label="Выключить синтез речи"><i class="fa-solid fa-volume-off" aria-hidden="true"></i></button>
          <button type="button" data-a11y-setting="speech" data-a11y-value="on" aria-label="Включить синтез речи"><i class="fa-solid fa-volume-high" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="accessibility-group accessibility-actions" role="group" aria-label="Настройки версии">
        <span>Настройки</span>
        <div class="accessibility-control-row">
          <button type="button" data-a11y-action="advanced" aria-expanded="false" aria-controls="accessibilityAdvanced" aria-label="Дополнительные настройки"><i class="fa-solid fa-gear" aria-hidden="true"></i></button>
          <button class="accessibility-exit" type="button" data-a11y-action="exit">Обычная версия сайта</button>
          <button class="accessibility-close" type="button" data-a11y-action="close" aria-label="Свернуть панель"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="accessibility-advanced" id="accessibilityAdvanced" hidden>
        <div class="accessibility-advanced-inner">
          <div class="accessibility-group" role="group" aria-label="Интервалы текста">
            <span>Интервалы текста</span>
            <div class="accessibility-control-row">
              <button type="button" data-a11y-setting="spacing" data-a11y-value="normal">Обычные</button>
              <button type="button" data-a11y-setting="spacing" data-a11y-value="wide">Увеличенные</button>
            </div>
          </div>
          <button class="accessibility-reset" type="button" data-a11y-action="reset"><i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> Сбросить настройки</button>
        </div>
      </div>
    </div>
  `;
  header.insertAdjacentElement('afterend', accessibilityPanel);

  const footerAccessibilityTarget = document.querySelector('.footer-meta-links');
  let footerAccessibilityToggle = null;
  const mobileAccessibilityToggle = document.createElement('button');
  mobileAccessibilityToggle.className = 'mobile-header-accessibility-toggle';
  mobileAccessibilityToggle.type = 'button';
  mobileAccessibilityToggle.setAttribute('aria-controls', 'accessibilityPanel');
  mobileAccessibilityToggle.setAttribute('aria-label', 'Настройки версии для слабовидящих');
  mobileAccessibilityToggle.title = 'Версия для слабовидящих';
  mobileAccessibilityToggle.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
  headerLine.appendChild(mobileAccessibilityToggle);
  if (footerAccessibilityTarget) {
    footerAccessibilityToggle = document.createElement('button');
    footerAccessibilityToggle.className = 'footer-accessibility-toggle';
    footerAccessibilityToggle.type = 'button';
    footerAccessibilityToggle.innerHTML = '<i class="fa-regular fa-eye" aria-hidden="true"></i> Версия для слабовидящих';
    footerAccessibilityTarget.appendChild(footerAccessibilityToggle);
  }

  const persistAccessibilitySettings = () => {
    try {
      window.localStorage.setItem(accessibilityStorageKey, JSON.stringify(accessibilitySettings));
    } catch (error) {
      // The selected mode still works for the current page when storage is unavailable.
    }
  };

  const updateAccessibilityPanelOffset = () => {
    window.requestAnimationFrame(() => {
      if (accessibilityPanel.hidden) {
        document.documentElement.style.removeProperty('--a11y-panel-height');
        return;
      }
      document.documentElement.style.setProperty('--a11y-panel-height', `${accessibilityPanel.offsetHeight}px`);
    });
  };

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    root.classList.toggle('a11y-mode', accessibilitySettings.enabled);
    ['normal', 'large', 'xlarge'].forEach((value) => root.classList.toggle(`a11y-font-${value}`, accessibilitySettings.enabled && accessibilitySettings.font === value));
    ['light', 'contrast', 'blue', 'beige', 'brown'].forEach((value) => root.classList.toggle(`a11y-theme-${value}`, accessibilitySettings.enabled && accessibilitySettings.theme === value));
    root.classList.toggle('a11y-spacing-wide', accessibilitySettings.enabled && accessibilitySettings.spacing === 'wide');
    root.classList.toggle('a11y-images-hide', accessibilitySettings.enabled && accessibilitySettings.images === 'hide');
    root.classList.toggle('a11y-images-grayscale', accessibilitySettings.enabled && accessibilitySettings.images === 'grayscale');

    document.querySelectorAll('[data-a11y-setting]').forEach((button) => {
      const isActive = accessibilitySettings.enabled && accessibilitySettings[button.dataset.a11ySetting] === button.dataset.a11yValue;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    [accessibilityToggle, footerAccessibilityToggle, mobileAccessibilityToggle].filter(Boolean).forEach((button) => {
      button.classList.toggle('is-active', accessibilitySettings.enabled);
      button.setAttribute('aria-pressed', String(accessibilitySettings.enabled));
    });
    accessibilityToggle.setAttribute('aria-label', accessibilitySettings.enabled ? 'Настройки версии для слабовидящих' : 'Включить версию для слабовидящих');
    if (accessibilitySettings.speech !== 'on' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    persistAccessibilitySettings();
    updateAccessibilityPanelOffset();
  };

  const openAccessibilityPanel = (trigger) => {
    accessibilitySettings.enabled = true;
    accessibilitySettings.panelOpen = true;
    accessibilityPanel.hidden = false;
    document.documentElement.classList.add('a11y-panel-open');
    accessibilityToggle.setAttribute('aria-expanded', 'true');
    applyAccessibilitySettings();
    accessibilityPanel.dataset.trigger = trigger?.className || '';
    updateAccessibilityPanelOffset();
    window.requestAnimationFrame(() => accessibilityPanel.querySelector('[data-a11y-setting]')?.focus());
  };

  const closeAccessibilityPanel = () => {
    const advanced = accessibilityPanel.querySelector('.accessibility-advanced');
    const advancedToggle = accessibilityPanel.querySelector('[data-a11y-action="advanced"]');
    advanced.hidden = true;
    advancedToggle.setAttribute('aria-expanded', 'false');
    accessibilitySettings.panelOpen = false;
    accessibilityPanel.hidden = true;
    document.documentElement.classList.remove('a11y-panel-open');
    document.documentElement.style.removeProperty('--a11y-panel-height');
    accessibilityToggle.setAttribute('aria-expanded', 'false');
    persistAccessibilitySettings();
  };

  accessibilityToggle.addEventListener('click', () => {
    if (accessibilityPanel.hidden) openAccessibilityPanel(accessibilityToggle);
    else closeAccessibilityPanel();
  });
  footerAccessibilityToggle?.addEventListener('click', () => openAccessibilityPanel(footerAccessibilityToggle));

  accessibilityPanel.addEventListener('click', (event) => {
    const settingButton = event.target.closest('[data-a11y-setting]');
    if (settingButton) {
      accessibilitySettings.enabled = true;
      accessibilitySettings[settingButton.dataset.a11ySetting] = settingButton.dataset.a11yValue;
      applyAccessibilitySettings();
      return;
    }

    const actionButton = event.target.closest('[data-a11y-action]');
    if (!actionButton) return;
    if (actionButton.dataset.a11yAction === 'close') closeAccessibilityPanel();
    if (actionButton.dataset.a11yAction === 'font-decrease') {
      const fonts = ['normal', 'large', 'xlarge'];
      accessibilitySettings.font = fonts[Math.max(0, fonts.indexOf(accessibilitySettings.font) - 1)];
      applyAccessibilitySettings();
    }
    if (actionButton.dataset.a11yAction === 'font-increase') {
      const fonts = ['normal', 'large', 'xlarge'];
      accessibilitySettings.font = fonts[Math.min(fonts.length - 1, fonts.indexOf(accessibilitySettings.font) + 1)];
      applyAccessibilitySettings();
    }
    if (actionButton.dataset.a11yAction === 'advanced') {
      const advanced = accessibilityPanel.querySelector('.accessibility-advanced');
      advanced.hidden = !advanced.hidden;
      actionButton.setAttribute('aria-expanded', String(!advanced.hidden));
      updateAccessibilityPanelOffset();
    }
    if (actionButton.dataset.a11yAction === 'reset') {
      accessibilitySettings = { ...accessibilityDefaults, enabled: true, panelOpen: true };
      applyAccessibilitySettings();
    }
    if (actionButton.dataset.a11yAction === 'exit') {
      accessibilitySettings = { ...accessibilityDefaults };
      applyAccessibilitySettings();
      closeAccessibilityPanel();
      accessibilityToggle.focus();
    }
  });

  applyAccessibilitySettings();
  if (accessibilitySettings.enabled && accessibilitySettings.panelOpen) {
    accessibilityPanel.hidden = false;
    document.documentElement.classList.add('a11y-panel-open');
    accessibilityToggle.setAttribute('aria-expanded', 'true');
    updateAccessibilityPanelOffset();
  }

  let speechTimer = 0;
  let lastSpokenText = '';
  const speakElement = (element) => {
    if (!accessibilitySettings.enabled || accessibilitySettings.speech !== 'on' || !('speechSynthesis' in window)) return;
    const readable = element.closest('a, button, summary, label, h1, h2, h3, h4, p, li');
    if (!readable || readable.closest('.accessibility-panel')) return;
    const text = (readable.getAttribute('aria-label') || readable.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 320);
    if (!text || text === lastSpokenText) return;
    window.clearTimeout(speechTimer);
    speechTimer = window.setTimeout(() => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
      lastSpokenText = text;
    }, 180);
  };

  document.addEventListener('mouseover', (event) => speakElement(event.target));
  document.addEventListener('focusin', (event) => speakElement(event.target));

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
        <a href="diseases.html">Заболевания</a>
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

  applyAccessibilitySettings();
  mobileAccessibilityToggle?.addEventListener('click', () => {
    setMenuState(false);
    openAccessibilityPanel(mobileAccessibilityToggle);
  });

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
    if (event.key === 'Escape') {
      setMenuState(false);
      if (!accessibilityPanel.hidden) {
        closeAccessibilityPanel();
        accessibilityToggle.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 900px)').matches) setMenuState(false);
    updateAccessibilityPanelOffset();
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
