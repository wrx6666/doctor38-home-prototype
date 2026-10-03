function hasRequiredViewerElements(elements) {
  return Object.values(elements).every(Boolean);
}

export function initStories() {
  const cards = Array.from(document.querySelectorAll('[data-story]'));
  const viewer = document.querySelector('.story-viewer');
  if (!cards.length || !viewer) return;

  const elements = {
    image: viewer.querySelector('.story-viewer-media img'),
    title: viewer.querySelector('#story-viewer-title'),
    text: viewer.querySelector('.story-viewer-text'),
    count: viewer.querySelector('.story-viewer-count'),
    progress: viewer.querySelector('.story-viewer-progress'),
    previousButton: viewer.querySelector('.story-viewer-prev'),
    nextButton: viewer.querySelector('.story-viewer-next'),
    closeButton: viewer.querySelector('.story-viewer-close')
  };
  if (!hasRequiredViewerElements(elements)) return;

  let currentIndex = 0;
  let lastTrigger = null;
  let touchStartX = 0;

  elements.progress.innerHTML = cards.map(() => '<span></span>').join('');

  const updateViewer = (requestedIndex, { animate = true } = {}) => {
    currentIndex = Math.max(0, Math.min(requestedIndex, cards.length - 1));
    const card = cards[currentIndex];
    const cardImage = card.querySelector('img');

    if (animate) {
      viewer.classList.remove('is-switching');
      void viewer.offsetWidth;
      viewer.classList.add('is-switching');
    }

    elements.image.src = cardImage?.src || card.dataset.storyImage || '';
    elements.image.srcset = cardImage?.srcset || '';
    elements.image.sizes = '100vw';
    elements.image.alt = cardImage?.alt || '';
    elements.title.textContent = card.dataset.storyTitle || '';
    elements.text.textContent = card.dataset.storyCopy || '';
    elements.count.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;

    elements.progress.querySelectorAll('span').forEach((item, index) => {
      item.classList.toggle('is-complete', index < currentIndex);
      item.classList.toggle('is-current', index === currentIndex);
    });

    elements.previousButton.disabled = currentIndex === 0;
    elements.nextButton.disabled = currentIndex === cards.length - 1;
  };

  const openViewer = (index, trigger) => {
    lastTrigger = trigger;
    updateViewer(index, { animate: false });
    document.body.classList.add('story-viewer-open');

    if (typeof viewer.showModal === 'function') {
      if (!viewer.open) viewer.showModal();
    } else {
      viewer.setAttribute('open', '');
    }

    elements.closeButton.focus();
  };

  const closeViewer = () => {
    document.body.classList.remove('story-viewer-open');

    if (typeof viewer.close === 'function' && viewer.open) viewer.close();
    else viewer.removeAttribute('open');

    lastTrigger?.focus();
  };

  cards.forEach((card, index) => {
    card.addEventListener('click', () => openViewer(index, card));
  });

  elements.previousButton.addEventListener('click', () => updateViewer(currentIndex - 1));
  elements.nextButton.addEventListener('click', () => updateViewer(currentIndex + 1));
  elements.closeButton.addEventListener('click', closeViewer);

  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) closeViewer();
  });

  viewer.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeViewer();
  });

  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && currentIndex > 0) updateViewer(currentIndex - 1);
    if (event.key === 'ArrowRight' && currentIndex < cards.length - 1) updateViewer(currentIndex + 1);
  });

  viewer.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });

  viewer.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0]?.clientX || 0;
    const distance = touchEndX - touchStartX;

    if (distance > 64 && currentIndex > 0) updateViewer(currentIndex - 1);
    if (distance < -64 && currentIndex < cards.length - 1) updateViewer(currentIndex + 1);
  }, { passive: true });
}
