const DEFAULT_OPTIONS = {
  threshold: 0.16,
  rootMargin: '-7% 0px -10% 0px'
};

export function initScrollReveal(options = {}) {
  const elements = Array.from(document.querySelectorAll('[data-reveal], [data-reveal-item]'));
  if (!elements.length) return;

  document.documentElement.classList.add('has-scroll-reveal');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { ...DEFAULT_OPTIONS, ...options });

  elements.forEach((element) => observer.observe(element));
}
