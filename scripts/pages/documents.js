function formatDocumentCount(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return `${count} документ`;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `${count} документа`;
  }
  return `${count} документов`;
}

function getFilterIds(filter = 'all') {
  return filter.split(',').map((id) => id.trim()).filter(Boolean);
}

export function initDocumentsPage() {
  const filterLinks = Array.from(document.querySelectorAll('[data-doc-filter]'));
  const groups = Array.from(document.querySelectorAll('.document-group'));
  if (!filterLinks.length || !groups.length) return;

  groups.forEach((group) => {
    const heading = group.querySelector('.group-head h2');
    const count = group.querySelectorAll('.document-file').length;
    if (!heading || count === 0 || heading.querySelector('.document-count')) return;

    const counter = document.createElement('span');
    counter.className = 'document-count';
    counter.textContent = formatDocumentCount(count);
    heading.append(counter);
  });

  const showGroups = (filter = 'all') => {
    const filterIds = getFilterIds(filter);
    const showAll = filter === 'all';

    groups.forEach((group) => {
      group.classList.toggle('is-hidden', !showAll && !filterIds.includes(group.id));
    });
    filterLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.docFilter === filter);
    });
  };

  const scrollToContent = () => {
    const target = document.querySelector('.documents-page');
    if (!target) return;

    const headerOffset = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 18;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  filterLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const filter = link.dataset.docFilter || 'all';

      showGroups(filter);
      window.history.replaceState(null, '', filter === 'all' ? 'documents.html' : link.getAttribute('href'));
      window.requestAnimationFrame(scrollToContent);
    });
  });

  const hash = window.location.hash.slice(1);
  const initialLink = filterLinks.find((link) => getFilterIds(link.dataset.docFilter).includes(hash));
  showGroups(initialLink?.dataset.docFilter || 'all');
}
