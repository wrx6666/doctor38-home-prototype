import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { servicePriceCatalog } from '../scripts/data/service-prices.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:8088';
const htmlFiles = (await readdir(root)).filter((name) => name.endsWith('.html')).sort();
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
const issues = [];
const executablePath = process.env.QA_BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({ headless: true, executablePath });

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  for (const fileName of htmlFiles) {
    const page = await context.newPage();
    const runtimeErrors = [];
    let expectedYandexMapResourceFailure = false;
    page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      const text = message.text();
      const isExpectedLocalApiFailure = fileName === 'appointment.html'
        && text.includes('net::ERR_CONNECTION_REFUSED');
      const isExpectedYandexMapCorsFailure = fileName === 'contacts.html'
        && text.includes('mc.yandex.ru/watch')
        && text.includes('blocked by CORS policy');
      if (isExpectedYandexMapCorsFailure) expectedYandexMapResourceFailure = true;
      const isExpectedYandexMapFollowup = fileName === 'contacts.html'
        && expectedYandexMapResourceFailure
        && text === 'Failed to load resource: net::ERR_FAILED';
      if (isExpectedYandexMapFollowup) expectedYandexMapResourceFailure = false;
      if (message.type() === 'error' && !isExpectedLocalApiFailure && !isExpectedYandexMapCorsFailure && !isExpectedYandexMapFollowup) {
        runtimeErrors.push(`console: ${text}`);
      }
    });

    const response = await page.goto(`${baseUrl}/${fileName}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 1500 }).catch(() => {});
    const state = await page.evaluate(() => ({
      title: document.title.trim(),
      h1Count: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      mainVisible: Boolean(document.querySelector('main')),
    }));

    if (!response?.ok()) issues.push(`${viewport.name} ${fileName}: HTTP ${response?.status() ?? 'no response'}`);
    if (!state.title) issues.push(`${viewport.name} ${fileName}: empty title`);
    if (state.h1Count !== 1) issues.push(`${viewport.name} ${fileName}: h1=${state.h1Count}`);
    if (state.overflow) issues.push(`${viewport.name} ${fileName}: horizontal overflow`);
    if (!state.mainVisible) issues.push(`${viewport.name} ${fileName}: main element not found`);
    for (const error of runtimeErrors) issues.push(`${viewport.name} ${fileName}: ${error}`);
    await page.close();
  }
  await context.close();
}

const context = await browser.newContext({ viewport: viewports[0] });
const page = await context.newPage();

await page.goto(`${baseUrl}/prices.html`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.querySelectorAll('[data-price-item]').length > 0);
const priceState = await page.evaluate(() => ({
  items: document.querySelectorAll('[data-price-item]').length,
  categories: document.querySelectorAll('[data-price-filter]').length,
  busy: document.querySelector('[data-price-groups]')?.getAttribute('aria-busy'),
}));
if (priceState.items !== servicePriceCatalog.total) {
  issues.push(`prices.html: rendered ${priceState.items} of ${servicePriceCatalog.total} services`);
}
if (priceState.categories !== 17) issues.push(`prices.html: rendered ${priceState.categories} filters, expected 17 including "Все"`);
if (priceState.busy !== 'false') issues.push('prices.html: price catalog remains busy');

await page.goto(`${baseUrl}/doctors.html`, { waitUntil: 'domcontentloaded' });
const doctorFilters = await page.locator('[data-filter-group="specialty"]:not([data-filter-value="all"])').all();
for (const filter of doctorFilters) {
  const value = await filter.getAttribute('data-filter-value');
  await filter.click();
  const visibleCards = await page.locator('.doctor-card:visible').count();
  if (visibleCards === 0) issues.push(`doctors.html: specialty ${value} has no visible doctors`);
}

for (const fileName of ['index.html', 'appointment.html']) {
  await page.goto(`${baseUrl}/${fileName}`, { waitUntil: 'domcontentloaded' });
  const consent = await page.evaluate(() => ({
    checkbox: Boolean(document.querySelector('input[name="consent"][required]')),
    consentLink: Boolean(document.querySelector('a[href="personal-data-consent.html"]')),
    policyLink: Boolean(document.querySelector('a[href="assets/documents/personal-data-policy.docx"]')),
  }));
  if (!consent.checkbox) issues.push(`${fileName}: required consent checkbox not found`);
  if (!consent.consentLink) issues.push(`${fileName}: consent document link not found`);
  if (!consent.policyLink) issues.push(`${fileName}: personal-data policy link not found`);
}

await context.close();
await browser.close();

if (issues.length) {
  console.error(`QA failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`QA passed: ${htmlFiles.length} pages × ${viewports.length} viewports, ${servicePriceCatalog.total} prices, ${doctorFilters.length} doctor filters, consent links.`);
