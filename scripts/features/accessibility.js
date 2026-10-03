const STORAGE_KEY = 'doctor38-accessibility';
const FONT_SIZES = ['normal', 'large', 'xlarge'];
const THEMES = ['light', 'contrast', 'blue', 'beige', 'brown'];

const DEFAULT_SETTINGS = {
  enabled: false,
  panelOpen: false,
  font: 'normal',
  theme: 'light',
  spacing: 'normal',
  images: 'show',
  speech: 'off'
};

const ALLOWED_VALUES = {
  font: FONT_SIZES,
  theme: THEMES,
  spacing: ['normal', 'wide'],
  images: ['show', 'hide', 'grayscale'],
  speech: ['off', 'on']
};

const PANEL_MARKUP = `
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

function readSettings() {
  try {
    const savedSettings = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (!savedSettings || typeof savedSettings !== 'object') return { ...DEFAULT_SETTINGS };

    const settings = { ...DEFAULT_SETTINGS, ...savedSettings };
    Object.entries(ALLOWED_VALUES).forEach(([name, values]) => {
      if (!values.includes(settings[name])) settings[name] = DEFAULT_SETTINGS[name];
    });
    settings.enabled = Boolean(settings.enabled);
    settings.panelOpen = Boolean(settings.panelOpen);
    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function createIconButton(className, label, iconClass) {
  const existingButton = document.querySelector(`.${className}`);
  const button = existingButton || document.createElement('button');
  button.className = className;
  button.type = 'button';
  button.setAttribute('aria-controls', 'accessibilityPanel');
  button.setAttribute('aria-label', label);
  button.title = 'Версия для слабовидящих';
  if (!existingButton) button.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
  return button;
}

function initAccessibility({ closeMobileMenu = () => {} } = {}) {
  const header = document.querySelector('.site-header');
  const headerLine = document.querySelector('.header-line');
  if (!header || !headerLine) return;
  if (document.documentElement.dataset.accessibilityInitialized === 'true') return;
  document.documentElement.dataset.accessibilityInitialized = 'true';

  const contact = document.querySelector('.header-contact');
  const footerTarget = document.querySelector('.footer-meta-links');
  let settings = readSettings();
  let lastPanelTrigger = null;

  const desktopToggle = createIconButton(
    'accessibility-toggle',
    'Включить версию для слабовидящих',
    'fa-solid fa-eye'
  );
  if (!desktopToggle.isConnected) contact?.append(desktopToggle);

  const mobileToggle = createIconButton(
    'mobile-header-accessibility-toggle',
    'Настройки версии для слабовидящих',
    'fa-solid fa-eye'
  );
  const mobileMenuToggle = headerLine.querySelector('.mobile-nav-toggle');
  if (!mobileToggle.isConnected) headerLine.insertBefore(mobileToggle, mobileMenuToggle);

  let footerToggle = null;
  if (footerTarget) {
    footerToggle = document.createElement('button');
    footerToggle.className = 'footer-accessibility-toggle';
    footerToggle.type = 'button';
    footerToggle.innerHTML = '<i class="fa-regular fa-eye" aria-hidden="true"></i> Версия для слабовидящих';
    footerTarget.append(footerToggle);
  }

  const panel = document.createElement('section');
  panel.className = 'accessibility-panel';
  panel.id = 'accessibilityPanel';
  panel.setAttribute('aria-label', 'Настройки версии для слабовидящих');
  panel.hidden = true;
  panel.innerHTML = PANEL_MARKUP;
  header.insertAdjacentElement('afterend', panel);

  const advancedPanel = panel.querySelector('.accessibility-advanced');
  const advancedToggle = panel.querySelector('[data-a11y-action="advanced"]');
  const allToggles = [desktopToggle, mobileToggle, footerToggle].filter(Boolean);

  const persistSettings = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Settings remain active for the current page when storage is unavailable.
    }
  };

  const updatePanelOffset = () => {
    window.requestAnimationFrame(() => {
      if (panel.hidden) {
        document.documentElement.style.removeProperty('--a11y-panel-height');
        return;
      }

      document.documentElement.style.setProperty('--a11y-panel-height', `${panel.offsetHeight}px`);
    });
  };

  const applySettings = () => {
    const root = document.documentElement;
    root.classList.toggle('a11y-mode', settings.enabled);

    FONT_SIZES.forEach((value) => {
      root.classList.toggle(`a11y-font-${value}`, settings.enabled && settings.font === value);
    });
    THEMES.forEach((value) => {
      root.classList.toggle(`a11y-theme-${value}`, settings.enabled && settings.theme === value);
    });

    root.classList.toggle('a11y-spacing-wide', settings.enabled && settings.spacing === 'wide');
    root.classList.toggle('a11y-images-hide', settings.enabled && settings.images === 'hide');
    root.classList.toggle('a11y-images-grayscale', settings.enabled && settings.images === 'grayscale');

    panel.querySelectorAll('[data-a11y-setting]').forEach((button) => {
      const isActive = settings.enabled
        && settings[button.dataset.a11ySetting] === button.dataset.a11yValue;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    allToggles.forEach((button) => {
      button.classList.toggle('is-active', settings.enabled);
      button.setAttribute('aria-pressed', String(settings.enabled));
    });

    desktopToggle.setAttribute(
      'aria-label',
      settings.enabled ? 'Настройки версии для слабовидящих' : 'Включить версию для слабовидящих'
    );

    if (settings.speech !== 'on' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    persistSettings();
    updatePanelOffset();
  };

  const openPanel = (trigger) => {
    lastPanelTrigger = trigger;
    settings.enabled = true;
    settings.panelOpen = true;
    panel.hidden = false;
    document.documentElement.classList.add('a11y-panel-open');
    desktopToggle.setAttribute('aria-expanded', 'true');
    applySettings();
    window.requestAnimationFrame(() => panel.querySelector('[data-a11y-setting]')?.focus());
  };

  const closePanel = ({ restoreFocus = false } = {}) => {
    advancedPanel.hidden = true;
    advancedToggle.setAttribute('aria-expanded', 'false');
    settings.panelOpen = false;
    panel.hidden = true;
    document.documentElement.classList.remove('a11y-panel-open');
    document.documentElement.style.removeProperty('--a11y-panel-height');
    desktopToggle.setAttribute('aria-expanded', 'false');
    persistSettings();

    if (restoreFocus) lastPanelTrigger?.focus();
  };

  desktopToggle.addEventListener('click', () => {
    if (panel.hidden) openPanel(desktopToggle);
    else closePanel();
  });

  mobileToggle.addEventListener('click', () => {
    closeMobileMenu();
    openPanel(mobileToggle);
  });

  footerToggle?.addEventListener('click', () => openPanel(footerToggle));

  panel.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const settingButton = event.target.closest('[data-a11y-setting]');
    if (settingButton) {
      settings.enabled = true;
      settings[settingButton.dataset.a11ySetting] = settingButton.dataset.a11yValue;
      applySettings();
      return;
    }

    const actionButton = event.target.closest('[data-a11y-action]');
    if (!actionButton) return;

    switch (actionButton.dataset.a11yAction) {
      case 'close':
        closePanel({ restoreFocus: true });
        break;
      case 'font-decrease': {
        const currentIndex = FONT_SIZES.indexOf(settings.font);
        settings.font = FONT_SIZES[Math.max(0, currentIndex - 1)];
        applySettings();
        break;
      }
      case 'font-increase': {
        const currentIndex = FONT_SIZES.indexOf(settings.font);
        settings.font = FONT_SIZES[Math.min(FONT_SIZES.length - 1, currentIndex + 1)];
        applySettings();
        break;
      }
      case 'advanced':
        advancedPanel.hidden = !advancedPanel.hidden;
        advancedToggle.setAttribute('aria-expanded', String(!advancedPanel.hidden));
        updatePanelOffset();
        break;
      case 'reset':
        settings = { ...DEFAULT_SETTINGS, enabled: true, panelOpen: true };
        applySettings();
        break;
      case 'exit':
        settings = { ...DEFAULT_SETTINGS };
        applySettings();
        closePanel({ restoreFocus: true });
        break;
      default:
        break;
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel({ restoreFocus: true });
  });

  window.addEventListener('resize', updatePanelOffset);

  let speechTimer = 0;
  let lastSpokenText = '';
  const speakTarget = (target) => {
    if (!(target instanceof Element)) return;
    if (!settings.enabled || settings.speech !== 'on' || !('speechSynthesis' in window)) return;

    const readableElement = target.closest('a, button, summary, label, h1, h2, h3, h4, p, li');
    if (!readableElement || readableElement.closest('.accessibility-panel')) return;

    const text = (readableElement.getAttribute('aria-label') || readableElement.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 320);
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

  document.addEventListener('mouseover', (event) => speakTarget(event.target));
  document.addEventListener('focusin', (event) => speakTarget(event.target));

  applySettings();
  if (settings.enabled && settings.panelOpen) {
    panel.hidden = false;
    document.documentElement.classList.add('a11y-panel-open');
    desktopToggle.setAttribute('aria-expanded', 'true');
    updatePanelOffset();
  }
}

globalThis.Doctor38Accessibility = { initAccessibility };

const initializeAccessibility = () => initAccessibility({
  closeMobileMenu: () => globalThis.Doctor38Navigation?.closeMobileMenu?.()
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAccessibility, { once: true });
} else {
  initializeAccessibility();
}
