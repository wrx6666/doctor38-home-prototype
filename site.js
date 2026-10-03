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
  ['[data-price-section]', () => import('./scripts/pages/prices.js').then(({ initPricesPage }) => initPricesPage())]
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
