import path from 'node:path';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto('http://127.0.0.1:8088/appointment.html', { waitUntil: 'domcontentloaded' });
  const consent = page.locator('.booking-form .appointment-consent');
  await consent.scrollIntoViewIfNeeded();
  const before = await consent.locator('input').isChecked();
  await consent.locator('label[for="bookingConsent"]').click();
  const after = await consent.locator('input').isChecked();
  const styles = await page.evaluate(() => ({
    consentColor: getComputedStyle(document.querySelector('.booking-form .appointment-consent span')).color,
    consentWidth: document.querySelector('.booking-form .appointment-consent').getBoundingClientRect().width,
    noteAlignment: getComputedStyle(document.querySelector('.booking-form .form-note')).textAlign
  }));
  if (before || !after) throw new Error('The consent label does not toggle its checkbox.');
  if (styles.noteAlignment !== 'center') throw new Error(`Unexpected note alignment: ${styles.noteAlignment}`);
  await page.locator('input[name="service"][value="Подбор направления"]').check();
  const selectedDirection = await page.locator('[data-summary="service"]').textContent();
  if (selectedDirection?.trim() !== 'Подбор направления') {
    throw new Error(`Unexpected direction summary: ${selectedDirection}`);
  }
  console.log(JSON.stringify(styles, null, 2));
  await page.screenshot({ path: path.join(process.env.TEMP, 'doctor38-appointment-consent.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const mobileConsent = page.locator('.booking-form .appointment-consent');
  await mobileConsent.scrollIntoViewIfNeeded();
  await mobileConsent.locator('label[for="bookingConsent"]').click();
  if (!await mobileConsent.locator('input').isChecked()) {
    throw new Error('The consent label does not toggle its checkbox on mobile.');
  }
  await page.screenshot({ path: path.join(process.env.TEMP, 'doctor38-appointment-consent-mobile.png'), fullPage: true });
} finally {
  await browser.close();
}
