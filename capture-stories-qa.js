import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:8088';
const BROWSER_CHANNEL = process.env.QA_BROWSER_CHANNEL || 'msedge';
const OUTPUT_DIRECTORY = path.resolve('audit-screenshots/stories');

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'mobile-390', width: 390, height: 844 }
];

async function captureStories(browser, viewport, errors) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1
  });

  try {
    const page = await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${viewport.name}: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`${viewport.name}: ${error.message}`));

    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
    await page.locator('.clinic-stories').scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await page.locator('.clinic-stories').screenshot({
      path: path.join(OUTPUT_DIRECTORY, `${viewport.name}-section.png`)
    });

    await page.getByRole('button', { name: 'Открыть историю: Первичный прием' }).click();
    await page.waitForTimeout(320);
    await page.locator('.story-viewer').screenshot({
      path: path.join(OUTPUT_DIRECTORY, `${viewport.name}-viewer.png`)
    });

    await page.getByRole('button', { name: 'Следующая история' }).click();
    const secondTitle = await page.locator('#story-viewer-title').textContent();
    if (secondTitle !== 'Обследование') {
      throw new Error(`${viewport.name}: story navigation failed`);
    }

    await page.getByRole('button', { name: 'Закрыть историю' }).click();
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: BROWSER_CHANNEL });
  const errors = [];

  try {
    for (const viewport of VIEWPORTS) {
      await captureStories(browser, viewport, errors);
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIRECTORY, 'console-errors.json'),
    JSON.stringify(errors, null, 2)
  );

  if (errors.length) throw new Error(`Console errors: ${errors.join(' | ')}`);
  console.log(`Captured stories QA in ${OUTPUT_DIRECTORY}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
