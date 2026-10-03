const LOCAL_API_PORT = '5500';
const REQUEST_TIMEOUT_MS = 10_000;
const privateIpv4Pattern = /^(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})$/;

const isLocalHost = (hostname) => (
  hostname === 'localhost'
  || hostname === '127.0.0.1'
  || privateIpv4Pattern.test(hostname)
);

const getApiBaseUrl = () => {
  const override = globalThis.DOCTOR38_API_BASE_URL;
  if (typeof override === 'string' && override.trim()) {
    return override.replace(/\/+$/, '');
  }

  if (window.location.protocol === 'file:') {
    return `http://127.0.0.1:${LOCAL_API_PORT}/api/v1`;
  }

  if (isLocalHost(window.location.hostname)) {
    return `http://${window.location.hostname}:${LOCAL_API_PORT}/api/v1`;
  }

  return `${window.location.origin}/api/v1`;
};

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const request = async (path, options) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers
      },
      signal: controller.signal
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        payload?.error?.code || 'REQUEST_FAILED',
        payload?.error?.message || 'Не удалось выполнить запрос'
      );
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError(0, 'REQUEST_TIMEOUT', 'Сервер не ответил вовремя');
    }

    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'NETWORK_ERROR', 'Нет соединения с сервером');
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const createIdempotencyKey = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
};

export const createAppointmentRequest = (payload, idempotencyKey) => request('/appointments', {
  method: 'POST',
  headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
  body: JSON.stringify(payload)
});

export const getDoctors = (clinicId) => {
  const query = new URLSearchParams({ clinicId: String(clinicId) });
  return request(`/doctors?${query}`);
};

export const getAvailableSlots = ({ clinicId, doctorId, date }) => {
  const query = new URLSearchParams({
    clinicId: String(clinicId),
    doctorId: String(doctorId),
    date
  });

  return request(`/availability/slots?${query}`);
};

export const getAppointmentErrorMessage = (error) => {
  if (error instanceof ApiError) {
    if (['TOO_MANY_REQUESTS', 'TOO_MANY_APPOINTMENTS'].includes(error.code)) {
      return 'Слишком много попыток. Попробуйте отправить заявку через несколько минут.';
    }

    if (['NETWORK_ERROR', 'REQUEST_TIMEOUT', 'CRM_TIMEOUT', 'CRM_UNAVAILABLE'].includes(error.code)) {
      return 'Сервис временно недоступен. Позвоните нам по номеру +7 (3952) 23-23-03.';
    }

    if (['BOT_CHECK_REQUIRED', 'BOT_CHECK_FAILED', 'INVALID_BOT_CHECK'].includes(error.code)) {
      return 'Проверка безопасности не пройдена. Подтвердите, что вы не робот, и повторите отправку.';
    }

    if (error.code === 'BOT_CHECK_UNAVAILABLE') {
      return 'Проверка безопасности временно недоступна. Попробуйте ещё раз или позвоните нам.';
    }
  }

  return 'Не удалось отправить заявку. Позвоните нам по номеру +7 (3952) 23-23-03.';
};
