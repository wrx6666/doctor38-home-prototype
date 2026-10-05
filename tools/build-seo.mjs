import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://doctor38.ru';
const excludedFromIndex = new Set(['doctor.html', 'diseases.html']);

const htmlFiles = (await readdir(root))
  .filter((name) => name.endsWith('.html'))
  .sort((left, right) => left.localeCompare(right, 'ru'));

function canonicalUrl(fileName) {
  return fileName === 'index.html' ? `${origin}/` : `${origin}/${fileName}`;
}

function insertHeadTag(source, tag) {
  const description = /<meta\s+name=["']description["'][^>]*>/i;
  if (description.test(source)) {
    return source.replace(description, (match) => `${match}\n${tag}`);
  }

  return source.replace(/<title>[^<]*<\/title>/i, (match) => `${match}\n${tag}`);
}

function replaceUniqueHeadTag(source, matcher, tag) {
  const withoutExistingTags = source.replace(matcher, '');
  return insertHeadTag(withoutExistingTags, tag);
}

for (const fileName of htmlFiles) {
  const filePath = path.join(root, fileName);
  let source = await readFile(filePath, 'utf8');

  if (excludedFromIndex.has(fileName)) {
    source = replaceUniqueHeadTag(
      source,
      /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>\s*/gi,
      '  <meta name="robots" content="noindex, follow">',
    );
    source = source.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '');
  } else {
    source = source.replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>\s*/gi, '');
    const canonical = `  <link rel="canonical" href="${canonicalUrl(fileName)}">`;
    source = replaceUniqueHeadTag(
      source,
      /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi,
      canonical,
    );
  }

  await writeFile(filePath, source, 'utf8');
}

const sitemapEntries = htmlFiles
  .filter((fileName) => !excludedFromIndex.has(fileName))
  .map((fileName) => `  <url>\n    <loc>${canonicalUrl(fileName)}</loc>\n  </url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
Host: doctor38.ru
`;

await Promise.all([
  writeFile(path.join(root, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(path.join(root, 'robots.txt'), robots, 'utf8'),
]);

console.log(`SEO metadata prepared for ${htmlFiles.length} HTML pages.`);
