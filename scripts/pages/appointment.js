import {
  createIdempotencyKey,
  createAppointmentRequest,
  getAppointmentErrorMessage,
  getAvailableSlots,
  getDoctors
} from '../core/api.js';
import { setupTurnstile } from '../core/turnstile.js';
import { createPersonalDataConsent } from '../data/consent.js';

const BRANCH_NAMES = {
  gavrilova: 'Иркутск, улица Николая Гаврилова, 4',
  lermontova: 'Лермонтова, 69'
};

const ADMIN_DOCTOR_LABEL = 'Подобрать администратору';
const ADMIN_TIME_LABEL = 'Подберет администратор';

const getClinicDate = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Irkutsk',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts();
  const getPart = (type) => parts.find((part) => part.type === type)?.value || '';

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
};

const formatDate = (value) => {
  const [year, month, day] = String(value).split('-');
  return year && month && day ? `${day}.${month}.${year}` : 'не выбрана';
};

const setStatus = (element, message, state = '') => {
  if (!element) return;

  element.textContent = message;
  element.hidden = !message;
  if (state) element.dataset.state = state;
  else delete element.dataset.state;
};

const createOption = (value, label) => {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
};

export function initAppointmentPage() {
  const form = document.querySelector('#bookingForm');
  if (!form) return;

  const summary = {
    branch: document.querySelector('[data-summary="branch"]'),
    service: document.querySelector('[data-summary="service"]'),
    doctor: document.querySelector('[data-summary="doctor"]'),
    date: document.querySelector('[data-summary="date"]'),
    time: document.querySelector('[data-summary="time"]')
  };
  const dateInput = form.querySelector('input[name="date"]');
  const doctorSelect = form.querySelector('select[name="doctor"]');
  const doctorStatus = form.querySelector('[data-doctors-status]');
  const timeSlots = form.querySelector('[data-time-slots]');
  const slotsStatus = form.querySelector('[data-slots-status]');
  const alternativeSlots = form.querySelector('[data-alternative-slots]');
  const alternativeBranch = form.querySelector('[data-alternative-branch]');
  const alternativeTimes = form.querySelector('[data-alternative-times]');
  const switchBranchButton = form.querySelector('[data-switch-branch]');
  const successMessage = document.querySelector('#bookingSuccess');
  const submitButton = form.querySelector('button[type="submit"]');
  const botCheck = setupTurnstile(form.querySelector('[data-turnstile]'));
  const today = getClinicDate();
  let doctorsRequestSequence = 0;
  let slotsRequestSequence = 0;
  let idempotencyKey = createIdempotencyKey();

  if (!dateInput || !doctorSelect || !timeSlots || !submitButton) return;

  dateInput.min = today;
  if (!dateInput.value) dateInput.value = today;

  const getSelectedBranch = () => form.querySelector('input[name="branch"]:checked');
  const getSelectedClinicId = () => getSelectedBranch()?.dataset.clinicId || '';
  const getSelectedDoctorName = () => (
    doctorSelect.value
      ? doctorSelect.selectedOptions[0]?.textContent?.trim() || ADMIN_DOCTOR_LABEL
      : ADMIN_DOCTOR_LABEL
  );

  const updateSummary = () => {
    const formData = new FormData(form);
    const selectedTime = timeSlots.querySelector('button.active');

    if (summary.branch) summary.branch.textContent = formData.get('branch') || 'не выбран';
    if (summary.service) summary.service.textContent = formData.get('service') || 'не выбрана';
    if (summary.doctor) summary.doctor.textContent = getSelectedDoctorName();
    if (summary.date) summary.date.textContent = formatDate(formData.get('date'));
    if (summary.time) summary.time.textContent = selectedTime?.textContent?.trim() || ADMIN_TIME_LABEL;
  };

  const hideAlternativeSlots = () => {
    if (!alternativeSlots) return;

    alternativeSlots.hidden = true;
    delete alternativeSlots.dataset.clinicId;
  };

  const resetSlots = (message, state = '') => {
    timeSlots.replaceChildren();
    hideAlternativeSlots();
    setStatus(slotsStatus, message, state);
    updateSummary();
  };

  const showAlternativeSlots = (branchInput, slots) => {
    if (!alternativeSlots || !alternativeBranch || !alternativeTimes) return;

    const visibleTimes = slots.slice(0, 3).map((slot) => String(slot.time));
    const remainingCount = slots.length - visibleTimes.length;

    alternativeBranch.textContent = branchInput.value;
    alternativeTimes.textContent = remainingCount > 0
      ? `${visibleTimes.join(' · ')} и ещё ${remainingCount}`
      : visibleTimes.join(' · ');
    alternativeSlots.dataset.clinicId = branchInput.dataset.clinicId || '';
    alternativeSlots.hidden = false;
  };

  const renderDoctorFallback = () => {
    doctorSelect.replaceChildren(createOption('', ADMIN_DOCTOR_LABEL));
  };

  const loadSlots = async () => {
    const clinicId = getSelectedClinicId();
    const doctorId = doctorSelect.value;
    const date = dateInput.value;
    const requestSequence = ++slotsRequestSequence;

    if (!doctorId) {
      resetSlots('Выберите врача, чтобы увидеть свободное время.');
      return;
    }

    if (!date) {
      resetSlots('Выберите дату приема.');
      return;
    }

    resetSlots('Загружаем свободное время…');

    try {
      const payload = await getAvailableSlots({ clinicId, doctorId, date });
      if (requestSequence !== slotsRequestSequence) return;

      const slots = Array.isArray(payload?.items) ? payload.items : [];
      if (slots.length === 0) {
        const selectedBranch = getSelectedBranch();
        const otherBranch = Array.from(form.querySelectorAll('input[name="branch"]'))
          .find((input) => input !== selectedBranch);

        resetSlots(`На ${selectedBranch?.value || 'выбранном адресе'} в этот день свободного времени нет.`);

        if (!otherBranch?.dataset.clinicId) return;

        try {
          const alternativePayload = await getAvailableSlots({
            clinicId: otherBranch.dataset.clinicId,
            doctorId,
            date
          });
          if (requestSequence !== slotsRequestSequence) return;

          const alternativeItems = Array.isArray(alternativePayload?.items)
            ? alternativePayload.items
            : [];

          if (alternativeItems.length > 0) {
            showAlternativeSlots(otherBranch, alternativeItems);
          } else {
            setStatus(
              slotsStatus,
              'На выбранную дату свободного времени нет. Администратор предложит ближайший вариант.'
            );
          }
        } catch {
          if (requestSequence !== slotsRequestSequence) return;
          setStatus(
            slotsStatus,
            'На выбранную дату свободного времени нет. Администратор предложит ближайший вариант.'
          );
        }
        return;
      }

      const fragment = document.createDocumentFragment();
      slots.forEach((slot, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.slotId = String(slot.id);
        button.textContent = String(slot.time);
        button.classList.toggle('active', index === 0);
        fragment.append(button);
      });

      timeSlots.replaceChildren(fragment);
      setStatus(slotsStatus, '');
      updateSummary();
    } catch {
      if (requestSequence !== slotsRequestSequence) return;
      resetSlots('Не удалось загрузить расписание. Администратор уточнит время по телефону.', 'error');
    }
  };

  const loadDoctors = async (preferredDoctorName = '') => {
    const clinicId = getSelectedClinicId();
    const requestSequence = ++doctorsRequestSequence;
    slotsRequestSequence += 1;

    doctorSelect.disabled = true;
    doctorSelect.replaceChildren(createOption('', 'Загружаем врачей…'));
    setStatus(doctorStatus, 'Получаем список врачей…');
    resetSlots('Выберите врача, чтобы увидеть свободное время.');

    try {
      const payload = await getDoctors(clinicId);
      if (requestSequence !== doctorsRequestSequence) return;

      const doctors = Array.isArray(payload?.items)
        ? [...payload.items].sort((first, second) => first.name.localeCompare(second.name, 'ru'))
        : [];
      const fragment = document.createDocumentFragment();
      fragment.append(createOption('', ADMIN_DOCTOR_LABEL));

      doctors.forEach((doctor) => {
        const option = createOption(String(doctor.id), doctor.name);
        if (doctor.profession_titles) option.title = doctor.profession_titles;
        fragment.append(option);
      });

      doctorSelect.replaceChildren(fragment);

      const preferredOption = preferredDoctorName
        ? Array.from(doctorSelect.options).find((option) => option.textContent.trim() === preferredDoctorName)
        : null;

      if (preferredOption) {
        doctorSelect.value = preferredOption.value;
        setStatus(doctorStatus, '');
      } else if (preferredDoctorName) {
        setStatus(doctorStatus, 'Этот врач не найден в выбранном филиале. Администратор поможет с записью.');
      } else if (doctors.length === 0) {
        setStatus(doctorStatus, 'В этом филиале список врачей пока недоступен.');
      } else {
        setStatus(doctorStatus, '');
      }
    } catch {
      if (requestSequence !== doctorsRequestSequence) return;
      renderDoctorFallback();
      setStatus(
        doctorStatus,
        'Не удалось загрузить врачей. Оставьте контакты — администратор подберет специалиста.',
        'error'
      );
    } finally {
      if (requestSequence === doctorsRequestSequence) {
        doctorSelect.disabled = false;
        updateSummary();
        if (doctorSelect.value) void loadSlots();
      }
    }
  };

  const params = new URLSearchParams(window.location.search);
  const branchName = BRANCH_NAMES[params.get('branch')];
  if (branchName) {
    const branchInput = Array.from(form.querySelectorAll('input[name="branch"]'))
      .find((input) => input.value === branchName);
    if (branchInput) branchInput.checked = true;
  }

  if (params.get('service') === 'droppers') {
    const droppersOption = Array.from(form.querySelectorAll('input[name="service"]'))
      .find((input) => input.value === 'Капельницы');
    if (droppersOption) droppersOption.checked = true;
  }

  const requestedProgram = params.get('program');
  const comment = form.querySelector('textarea[name="comment"]');
  if (requestedProgram && comment) {
    comment.value = `Интересует программа капельниц: ${requestedProgram}`;
  }

  timeSlots.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-slot-id]');
    if (!button) return;

    timeSlots.querySelectorAll('button').forEach((item) => {
      item.classList.toggle('active', item === button);
    });
    updateSummary();
  });

  switchBranchButton?.addEventListener('click', () => {
    const clinicId = alternativeSlots?.dataset.clinicId;
    const branchInput = Array.from(form.querySelectorAll('input[name="branch"]'))
      .find((input) => input.dataset.clinicId === clinicId);
    if (!branchInput) return;

    const preferredDoctorName = doctorSelect.value ? getSelectedDoctorName() : '';
    branchInput.checked = true;
    updateSummary();
    void loadDoctors(preferredDoctorName);
  });

  form.addEventListener('input', updateSummary);
  form.addEventListener('change', (event) => {
    updateSummary();

    if (event.target.matches('input[name="branch"]')) {
      const preferredDoctorName = doctorSelect.value ? getSelectedDoctorName() : '';
      void loadDoctors(preferredDoctorName);
      return;
    }

    if (event.target.matches('select[name="doctor"], input[name="date"]')) {
      void loadSlots();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const activeTime = timeSlots.querySelector('button.active');
    const turnstileToken = botCheck.getToken();

    if (botCheck.enabled && !turnstileToken) {
      if (successMessage) {
        successMessage.dataset.state = 'error';
        successMessage.textContent = 'Подтвердите, что вы не робот.';
        successMessage.hidden = false;
      }
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    if (successMessage) successMessage.hidden = true;

    try {
      await createAppointmentRequest({
        clinicId: getSelectedClinicId(),
        direction: formData.get('service'),
        patient: {
          name: formData.get('name'),
          phone: formData.get('phone'),
          ...(formData.get('comment') ? { comment: formData.get('comment') } : {})
        },
        details: {
          branch: formData.get('branch'),
          doctor: getSelectedDoctorName(),
          date: formData.get('date'),
          ...(activeTime ? { time: activeTime.textContent.trim() } : {}),
          pageUrl: window.location.href
        },
        consent: createPersonalDataConsent(),
        ...(turnstileToken ? { turnstileToken } : {})
      }, idempotencyKey);

      idempotencyKey = createIdempotencyKey();
      botCheck.reset();

      if (successMessage) {
        successMessage.dataset.state = 'success';
        successMessage.textContent = 'Заявка отправлена. Администратор свяжется с вами для подтверждения записи.';
        successMessage.hidden = false;
      }
    } catch (error) {
      botCheck.reset();
      if (successMessage) {
        successMessage.dataset.state = 'error';
        successMessage.textContent = getAppointmentErrorMessage(error);
        successMessage.hidden = false;
      }
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  });

  updateSummary();
  void loadDoctors(params.get('doctor') || '');
}
