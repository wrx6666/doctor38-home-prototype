import { initScrollReveal } from './scripts/core/reveal.js';
import { initNavigation } from './scripts/features/navigation.js';

const optionalModules = [
  ['[data-story]', () => import('./scripts/features/stories.js').then(({ initStories }) => initStories())],
  ['#callbackForm', () => import('./scripts/features/callback-form.js').then(({ initCallbackForm }) => initCallbackForm())],
  ['#bookingForm', () => import('./scripts/pages/appointment.js').then(({ initAppointmentPage }) => initAppointmentPage())],
  ['[data-doctor-photo]', () => import('./scripts/pages/doctor-profile.js').then(({ initDoctorProfilePage }) => initDoctorProfilePage())],
  ['.doctor-card[data-specialty]', () => import('./scripts/pages/doctors.js').then(({ initDoctorsPage }) => initDoctorsPage())],
  ['[data-doc-filter]', () => import('./scripts/pages/documents.js').then(({ initDocumentsPage }) => initDocumentsPage())],
  ['[data-infusion-category]', () => import('./scripts/pages/droppers.js').then(({ initDroppersPage }) => initDroppersPage())],
  ['[data-analysis-groups]', () => import('./scripts/pages/analyses.js').then(({ initAnalysesPage }) => initAnalysesPage())],
  ['[data-ultrasound-groups]', () => import('./scripts/pages/ultrasound.js').then(({ initUltrasoundPage }) => initUltrasoundPage())],
  ['[data-cosmetology-groups]', () => import('./scripts/pages/cosmetology.js').then(({ initCosmetologyPage }) => initCosmetologyPage())],
  ['[data-treatment-groups]', () => import('./scripts/pages/treatment-room.js').then(({ initTreatmentRoomPage }) => initTreatmentRoomPage())],
  ['[data-price-groups]', () => import('./scripts/pages/prices.js')
    .then(({ initPricesPage }) => initPricesPage())
    .catch((error) => {
      console.error('Не удалось загрузить каталог цен.', error);
      const sidebar = document.querySelector('[data-price-sidebar]');
      const groups = document.querySelector('[data-price-groups]');
      sidebar?.setAttribute('aria-busy', 'false');
      groups?.setAttribute('aria-busy', 'false');
      if (sidebar) sidebar.hidden = true;
      if (groups) {
        const message = document.createElement('p');
        message.className = 'price-loading price-loading-card';
        message.setAttribute('role', 'alert');
        message.textContent = 'Не удалось загрузить цены. Обновите страницу или уточните стоимость у администратора.';
        groups.replaceChildren(message);
      }
    })]
];

const initializeSite = async () => {
  const navigation = initNavigation();
  globalThis.Doctor38Navigation = navigation;

  await Promise.all(optionalModules
    .filter(([selector]) => document.querySelector(selector))
    .map(([, load]) => load()));

  initScrollReveal();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSite, { once: true });
} else {
  initializeSite();
}
