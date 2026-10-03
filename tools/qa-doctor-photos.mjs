import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const mime = new Map([
  ['.css', 'text/css'],
  ['.html', 'text/html'],
  ['.js', 'text/javascript'],
  ['.webp', 'image/webp']
]);
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const filePath = path.join(root, pathname === '/' ? 'doctors.html' : pathname);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader('Content-Type', mime.get(path.extname(filePath)) ?? 'application/octet-stream');
  fs.createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const browser = await chromium.launch({ headless: true, channel: 'msedge' });

try {
  for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    const failures = [];
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(message.text());
    });
    page.on('pageerror', (error) => failures.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/doctors.html`, { waitUntil: 'networkidle' });
    const photoLocator = page.locator('.doctor-card > img');
    for (let index = 0; index < await photoLocator.count(); index += 1) {
      const photo = photoLocator.nth(index);
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate((image) => image.complete || new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      }));
    }
    const photos = await photoLocator.evaluateAll((images) => images.map((image) => ({
      alt: image.alt,
      currentSrc: image.currentSrc,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight
    })));
    if (photos.some((photo) => !photo.naturalWidth)) failures.push('At least one doctor photo failed to load.');
    if (name === 'desktop') {
      await page.locator('[data-filter-group="specialty"][data-filter-value="cosmetology"]').click();
      const visibleCosmetologists = await page.locator('.doctor-card:not(.is-hidden) h2').allTextContents();
      if (visibleCosmetologists.join('|') !== 'Мясникова Александра Валерьевна|Глазкова Яна Алексеевна') {
        failures.push(`Unexpected cosmetology filter result: ${visibleCosmetologists.join(', ')}`);
      }
      await page.locator('[data-filter-group="specialty"][data-filter-value="all"]').click();
      await page.locator('[data-filter-group="branch"][data-filter-value="lermontova"]').click();
      const visibleLermontova = await page.locator('.doctor-card:not(.is-hidden)').count();
      if (visibleLermontova !== 7) failures.push(`Unexpected Lermontova count: ${visibleLermontova}`);
      await page.locator('[data-filter-group="branch"][data-filter-value="all"]').click();
    }
    await page.screenshot({ path: path.join(process.env.TEMP, `doctor38-doctors-${name}.png`), fullPage: true });
    console.log(JSON.stringify({ name, photos, failures }, null, 2));
    await page.close();
  }

  const profilePage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const slug of ['myasnikova', 'stepanova', 'fedash', 'yuryeva']) {
    await profilePage.goto(`http://127.0.0.1:${port}/doctor.html?doctor=${slug}`, { waitUntil: 'networkidle' });
    const profile = await profilePage.locator('[data-doctor-photo]').evaluate((image) => ({
      alt: image.alt,
      currentSrc: image.currentSrc,
      naturalWidth: image.naturalWidth
    }));
    if (!profile.naturalWidth) throw new Error(`Profile photo failed to load: ${slug}`);
    console.log(JSON.stringify({ slug, profile }));
  }
  await profilePage.screenshot({ path: path.join(process.env.TEMP, 'doctor38-doctor-profile.png'), fullPage: true });
  await profilePage.close();
} finally {
  await browser.close();
  server.close();
}
