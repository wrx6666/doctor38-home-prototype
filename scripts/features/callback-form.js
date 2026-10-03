import {
  createIdempotencyKey,
  createAppointmentRequest,
  getAppointmentErrorMessage
} from '../core/api.js';
import { setupTurnstile } from '../core/turnstile.js';
import { createPersonalDataConsent } from '../data/consent.js';

const setStatus = (element, state, message) => {
  element.hidden = false;
  element.dataset.state = state;
  element.textContent = message;
};

export function initCallbackForm() {
  const form = document.querySelector('#callbackForm');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const botCheck = setupTurnstile(form.querySelector('[data-turnstile]'));
  let idempotencyKey = createIdempotencyKey();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const turnstileToken = botCheck.getToken();
    if (botCheck.enabled && !turnstileToken) {
      setStatus(status, 'error', 'Подтвердите, что вы не робот.');
      return;
    }
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    status.hidden = true;

    try {
      await createAppointmentRequest({
        direction: 'Обратный звонок',
        patient: {
          name: formData.get('name'),
          phone: formData.get('phone')
        },
        details: {
          pageUrl: window.location.href
        },
        consent: createPersonalDataConsent(),
        ...(turnstileToken ? { turnstileToken } : {})
      }, idempotencyKey);

      form.reset();
      botCheck.reset();
      idempotencyKey = createIdempotencyKey();
      setStatus(status, 'success', 'Заявка отправлена. Администратор свяжется с вами.');
    } catch (error) {
      botCheck.reset();
      setStatus(status, 'error', getAppointmentErrorMessage(error));
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  });
}
