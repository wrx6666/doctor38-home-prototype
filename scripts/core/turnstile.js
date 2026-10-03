const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise;

const getSiteKey = () => (
  document.querySelector('meta[name="turnstile-site-key"]')?.content.trim() || ''
);

const loadTurnstile = () => {
  if (globalThis.turnstile) return Promise.resolve(globalThis.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(globalThis.turnstile), { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
    document.head.append(script);
  });

  return scriptPromise;
};

export const setupTurnstile = (container) => {
  const siteKey = getSiteKey();
  let token = '';
  let widgetId;

  if (!container || !siteKey) {
    return {
      enabled: false,
      getToken: () => '',
      reset: () => {}
    };
  }

  container.hidden = false;
  void loadTurnstile()
    .then((turnstile) => {
      widgetId = turnstile.render(container, {
        sitekey: siteKey,
        action: 'appointment',
        theme: 'auto',
        callback: (value) => { token = value; },
        'expired-callback': () => { token = ''; },
        'error-callback': () => { token = ''; }
      });
    })
    .catch(() => {
      token = '';
    });

  return {
    enabled: true,
    getToken: () => token,
    reset: () => {
      token = '';
      if (widgetId !== undefined && globalThis.turnstile) {
        globalThis.turnstile.reset(widgetId);
      }
    }
  };
};
