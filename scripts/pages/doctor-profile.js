import { doctorProfiles } from '../data/doctors.js';

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function renderTags(container, tags) {
  if (!container) return;

  const elements = tags.map((tag) => {
    const element = document.createElement('span');
    element.textContent = tag;
    return element;
  });
  container.replaceChildren(...elements);
}

function renderServices(container, services) {
  if (!container) return;

  const elements = services.map((service) => {
    const item = document.createElement('div');
    item.dataset.revealItem = '';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-check';
    icon.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = service;
    item.append(icon, text);
    return item;
  });
  container.replaceChildren(...elements);
}

function renderPhoto(profile) {
  const image = document.querySelector('[data-doctor-photo]');
  const wrapper = document.querySelector('.doctor-profile-photo-wrap');
  if (!image || !wrapper) return;

  if (profile.photo) {
    image.src = profile.photo;
    const base = profile.photo.replace(/-\d+\.webp$/, '');
    const compactPhoto = /sukhareva$/.test(base);
    const widePhoto = /myasnikov$/.test(base);
    const widths = compactPhoto ? [320, 634] : (widePhoto ? [320, 640, 960, 1200] : [320, 640, 960]);
    image.srcset = widths.map((width) => `${base}-${width}.webp ${width}w`).join(', ');
    image.sizes = '(max-width: 700px) 100vw, 50vw';
    image.alt = profile.name;
    wrapper.classList.remove('is-placeholder');
    return;
  }

  const icon = document.createElement('i');
  icon.className = 'fa-regular fa-image';
  icon.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.textContent = 'Фото врача будет добавлено позже';
  wrapper.classList.add('is-placeholder');
  wrapper.replaceChildren(icon, label);
}

export function initDoctorProfilePage() {
  if (!document.querySelector('[data-doctor-name]')) return;

  const params = new URLSearchParams(window.location.search);
  const profile = doctorProfiles[params.get('doctor')] || doctorProfiles.sukhareva;

  document.title = `${profile.name} - Добрый Доктор`;
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    `${profile.name}: ${profile.specialty}. Запись на прием в медицинском центре Добрый Доктор в Иркутске.`
  );

  setText('[data-doctor-name]', profile.name);
  setText('[data-doctor-specialty]', profile.specialty);
  setText('[data-doctor-branches]', profile.branches);
  setText('[data-doctor-lead]', profile.lead);
  setText('[data-doctor-about]', profile.about);
  setText('[data-doctor-price]', profile.price);

  renderPhoto(profile);
  renderTags(document.querySelector('[data-doctor-tags]'), profile.tags);
  renderServices(document.querySelector('[data-doctor-services]'), profile.services);
}
