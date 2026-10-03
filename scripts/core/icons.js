const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const ICON_STYLE_CLASSES = new Set(['fa-solid', 'fa-regular']);

function getIconReference(element) {
  const styleClass = [...element.classList].find((className) => ICON_STYLE_CLASSES.has(className));
  const iconClass = [...element.classList].find((className) => (
    className.startsWith('fa-') && !ICON_STYLE_CLASSES.has(className)
  ));
  if (!styleClass || !iconClass) return null;

  return `fa-${styleClass.replace('fa-', '')}-${iconClass.replace('fa-', '')}`;
}

function hydrateIcon(element) {
  if (element.dataset.svgIcon === 'ready') return;

  const reference = getIconReference(element);
  if (!reference) return;
  const definition = globalThis.DOCTOR38_ICON_DEFINITIONS?.[reference];
  if (!definition) return;

  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.classList.add('icon-svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('viewBox', definition.viewBox);
  definition.paths.forEach((pathData) => {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('d', pathData);
    svg.append(path);
  });
  element.replaceChildren(svg);
  element.dataset.svgIcon = 'ready';
}

function hydrateIcons(root = document) {
  if (root instanceof Element && root.matches('i[class*="fa-"]')) hydrateIcon(root);
  root.querySelectorAll?.('i[class*="fa-"]').forEach(hydrateIcon);
}

function initIcons() {
  if (document.documentElement.dataset.iconsInitialized === 'true') return;
  document.documentElement.dataset.iconsInitialized = 'true';
  hydrateIcons();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) hydrateIcons(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

globalThis.Doctor38Icons = { hydrateIcons };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIcons, { once: true });
} else {
  initIcons();
}
