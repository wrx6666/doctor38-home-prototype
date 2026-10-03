export const PERSONAL_DATA_CONSENT_VERSION = '2026-10-03';

const getConsentDocumentUrl = () => {
  const baseUrl = window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8088/'
    : window.location.href;

  return new URL('personal-data-consent.html', baseUrl).href;
};

export const createPersonalDataConsent = () => ({
  accepted: true,
  version: PERSONAL_DATA_CONSENT_VERSION,
  documentUrl: getConsentDocumentUrl()
});
