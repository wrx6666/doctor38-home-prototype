import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const assetsDirectory = path.join(root, 'assets');
const widths = [320, 640, 960];
const pairs = process.argv.slice(2);

if (!pairs.length || pairs.length % 2 !== 0) {
  console.error('Usage: node tools/import-doctor-photos.mjs <source> <asset-stem> [...]');
  process.exit(1);
}

const jobs = [];
for (let index = 0; index < pairs.length; index += 2) {
  jobs.push({
    sourcePath: path.resolve(pairs[index]),
    stem: pairs[index + 1]
  });
}

const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const page = await browser.newPage();

try {
  for (const { sourcePath, stem } of jobs) {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source image not found: ${sourcePath}`);
    }

    const extension = path.extname(sourcePath).toLowerCase();
    const mime = extension === '.png' ? 'image/png' : 'image/jpeg';
    const data = fs.readFileSync(sourcePath).toString('base64');
    const variants = await page.evaluate(async ({ data, mime, widths }) => {
      const blob = await (await fetch(`data:${mime};base64,${data}`)).blob();
      const source = await createImageBitmap(blob);
      const results = [];

      for (const width of widths) {
        const height = Math.round(source.height * width / source.width);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(source, 0, 0, width, height);

        const output = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84));
        const encoded = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(output);
        });
        results.push({ width, height, encoded });
      }

      source.close();
      return results;
    }, { data, mime, widths });

    for (const { width, height, encoded } of variants) {
      const outputPath = path.join(assetsDirectory, `${stem}-${width}.webp`);
      fs.writeFileSync(outputPath, Buffer.from(encoded, 'base64'));
      console.log(`${path.basename(outputPath)}: ${width}x${height}`);
    }
  }
} finally {
  await browser.close();
}
