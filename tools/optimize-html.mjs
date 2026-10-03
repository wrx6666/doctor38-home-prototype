import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const images = {
  'branch-gavrilova': { width: 960, height: 1280, variants: [360, 720, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'branch-lermontova': { width: 800, height: 600, variants: [480, 800], sizes: '(max-width: 700px) 100vw, 50vw' },
  'card-checkup': { width: 1672, height: 941, variants: [480, 960, 1672], sizes: '(max-width: 700px) 100vw, 33vw' },
  'card-child': { width: 1672, height: 941, variants: [480, 960, 1672], sizes: '(max-width: 700px) 100vw, 33vw' },
  'card-corporate': { width: 1672, height: 941, variants: [480, 960, 1672], sizes: '(max-width: 700px) 100vw, 33vw' },
  'card-cosmetology': { width: 1672, height: 941, variants: [480, 960, 1672], sizes: '(max-width: 700px) 100vw, 33vw' },
  'card-doctor': { width: 1672, height: 941, variants: [480, 960, 1672], sizes: '(max-width: 700px) 100vw, 33vw' },
  'clinic-team-gavrilova': { width: 1280, height: 853, variants: [480, 960, 1280], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-myasnikov': { width: 1200, height: 1800, variants: [320, 640, 960, 1200], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-botova': { width: 960, height: 1635, variants: [320, 640, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-fedash': { width: 960, height: 1440, variants: [320, 640, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-nilova': { width: 960, height: 1442, variants: [320, 640, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-piksaeva': { width: 960, height: 1444, variants: [320, 640, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-stepanova': { width: 960, height: 1440, variants: [320, 640, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-sukhareva': { width: 634, height: 952, variants: [320, 634], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-myasnikova': { width: 960, height: 1440, variants: [320, 640, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'doctor-yuryeva': { width: 960, height: 1437, variants: [320, 640, 960], sizes: '(max-width: 700px) 100vw, 50vw' },
  'hero-clinic': { width: 1920, height: 1080, variants: [480, 960, 1920], sizes: '(max-width: 700px) 100vw, 50vw' },
  'infusion-room': { width: 1586, height: 992, variants: [480, 960, 1586], sizes: '(max-width: 700px) 100vw, 50vw' },
  'reception-hero': { width: 1672, height: 941, variants: [480, 960, 1672], sizes: '100vw' },
  ultrasound: { width: 1500, height: 860, variants: [480, 960, 1500], sizes: '(max-width: 700px) 100vw, 33vw' },
  logo: { width: 400, height: 100 }
};

const preloadByPage = {
  'checkups.html': ['card-doctor', '(max-width: 900px) 100vw, 48vw'],
  'children.html': ['card-doctor', '(max-width: 900px) 100vw, 48vw'],
  'cosmetology.html': ['card-doctor', '(max-width: 900px) 100vw, 48vw'],
  'diagnostics.html': ['card-doctor', '(max-width: 900px) 100vw, 48vw'],
  'doctors.html': ['hero-clinic', '(max-width: 900px) 100vw, 48vw'],
  'gynecologist.html': ['card-cosmetology', '(max-width: 900px) 100vw, 48vw'],
  'gynecology.html': ['card-doctor', '(max-width: 900px) 100vw, 48vw'],
  'index.html': ['reception-hero', '100vw'],
  'organizations.html': ['card-doctor', '(max-width: 900px) 100vw, 48vw'],
  'services.html': ['reception-hero', '(max-width: 900px) 100vw, 54vw']
};

function getImageName(source) {
  const fileName = path.basename(source);
  const stem = fileName.replace(/\.(?:png|jpe?g|webp)$/i, '');
  return stem.replace(/-\d+$/, '');
}

function getDefaultVariant(config) {
  return config.variants.find((width) => width >= 900)
    ?? config.variants.at(-1);
}

function getSrcset(name, config) {
  return config.variants
    .map((width) => `assets/${name}-${width}.webp ${width}w`)
    .join(', ');
}

function removePerformanceAttributes(tag) {
  return tag.replace(
    /\s+(?:loading|decoding|fetchpriority|width|height|srcset|sizes)=(?:"[^"]*"|'[^']*')/gi,
    ''
  );
}

function appendAttributes(tag, attributes) {
  return tag.replace(/\s*(\/?>)$/, ` ${attributes.join(' ')}$1`);
}

function optimizeImages(html, fileName) {
  let logoIndex = 0;

  return html.replace(/<img\b[^>]*>/gi, (originalTag) => {
    const sourceMatch = originalTag.match(/\bsrc=(?:"([^"]+)"|'([^']+)')/i);
    if (!sourceMatch) return originalTag;

    const source = sourceMatch[1] ?? sourceMatch[2];
    const name = getImageName(source);
    const config = images[name];
    if (!config) return originalTag;

    let tag = removePerformanceAttributes(originalTag);
    const attributes = [
      `width="${config.width}"`,
      `height="${config.height}"`,
      'decoding="async"'
    ];

    if (config.variants) {
      const defaultVariant = getDefaultVariant(config);
      tag = tag.replace(/\bsrc=(?:"[^"]+"|'[^']+')/i, `src="assets/${name}-${defaultVariant}.webp"`);
      attributes.push(`srcset="${getSrcset(name, config)}"`, `sizes="${config.sizes}"`);
    }

    const isHeaderLogo = name === 'logo' && logoIndex++ === 0;
    const isIndexHero = fileName === 'index.html' && name === 'reception-hero';
    const isDoctorHero = fileName === 'doctor.html' && tag.includes('data-doctor-photo');
    const isPriorityImage = isIndexHero || isDoctorHero;

    attributes.push(`loading="${isHeaderLogo || isPriorityImage ? 'eager' : 'lazy'}"`);
    if (isPriorityImage) attributes.push('fetchpriority="high"');

    return appendAttributes(tag, attributes);
  });
}

function addLcpPreload(html, fileName) {
  const preload = preloadByPage[fileName];
  if (!preload) return html;

  const [name, sizes] = preload;
  const config = images[name];
  const defaultVariant = getDefaultVariant(config);
  const link = `  <link rel="preload" as="image" href="assets/${name}-${defaultVariant}.webp" imagesrcset="${getSrcset(name, config)}" imagesizes="${sizes}" fetchpriority="high" data-lcp-preload>`;
  return html.replace(/(\s*<link rel="stylesheet" href="(?:styles\.css|styles\/pages\/[^"]+\.css)[^>]*>)/, `\n${link}$1`);
}

const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));

htmlFiles.forEach((fileName) => {
  const filePath = path.join(root, fileName);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\s*<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^>]+>/g, '');
  html = html.replace(/\s*<link[^>]+data-lcp-preload[^>]*>/g, '');
  html = optimizeImages(html, fileName);
  html = addLcpPreload(html, fileName);
  fs.writeFileSync(filePath, html);
});

console.log(`Optimized responsive image markup in ${htmlFiles.length} HTML files`);
