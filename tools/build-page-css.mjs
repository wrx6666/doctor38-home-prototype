import fs from 'node:fs';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';

const root = path.resolve(import.meta.dirname, '..');
const outputDirectory = path.join(root, 'styles', 'pages');
const sharedOutputDirectory = path.join(root, 'styles', 'dist');
const sourceDirectory = path.join(root, 'styles', 'source');
const sourceFiles = fs.readdirSync(sourceDirectory)
  .filter((file) => file.endsWith('.css'))
  .sort((left, right) => left.localeCompare(right, 'en'));
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));

const scriptSources = fs.readdirSync(path.join(root, 'scripts'), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
  .map((entry) => fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8'))
  .concat(fs.readFileSync(path.join(root, 'site.js'), 'utf8'))
  .join('\n');
const pricesScriptSource = fs.readFileSync(path.join(root, 'scripts', 'pages', 'prices.js'), 'utf8');
const analysesScriptSource = fs.readFileSync(path.join(root, 'scripts', 'pages', 'analyses.js'), 'utf8');
const ultrasoundScriptSource = fs.readFileSync(path.join(root, 'scripts', 'pages', 'ultrasound.js'), 'utf8');
const sharedScriptSources = scriptSources
  .replace(pricesScriptSource, '')
  .replace(analysesScriptSource, '')
  .replace(ultrasoundScriptSource, '');

const pageMainSources = sourceFiles.filter((file) => file <= '10-booking-prices.css');
const sharedResponsiveSources = ['11-footer-responsive.css'];
const pageOverrideSources = sourceFiles.filter((file) => file >= '12-home-mobile.css' && file <= '14-home-doctors.css');
const sharedAccessibilitySources = sourceFiles.filter((file) => file >= '15-accessible-mode.css');

function readSources(files) {
  return files.map((file) => fs.readFileSync(path.join(sourceDirectory, file), 'utf8')).join('');
}

async function purgeCss(source, content, name) {
  const [{ css }] = await new PurgeCSS().purge({
    content,
    css: [{ raw: source, name }],
    safelist: {
      standard: [
        /^active$/,
        /^a11y-/,
        /^has-/,
        /^is-/,
        /^menu-open$/,
        /^prices-page$/,
        /^reveal-/
      ],
      deep: [/^accessibility-/, /^mobile-nav-/]
    }
  });
  return css.replaceAll('url("assets/', 'url("../../assets/');
}

const pages = htmlFiles.map((htmlFile) => {
  const htmlPath = path.join(root, htmlFile);
  return {
    html: fs.readFileSync(htmlPath, 'utf8'),
    htmlFile,
    htmlPath,
    pageName: path.basename(htmlFile, '.html')
  };
});

const sharedContent = [
  ...pages.map(({ html }) => ({ raw: html, extension: 'html' })),
  { raw: scriptSources, extension: 'js' }
];

const sharedResponsiveCss = await purgeCss(
  readSources(sharedResponsiveSources),
  sharedContent,
  'shared-responsive'
);
const sharedAccessibilityCss = await purgeCss(
  readSources(sharedAccessibilitySources),
  sharedContent,
  'shared-accessibility'
);

for (const directory of [outputDirectory, sharedOutputDirectory]) {
  if (path.dirname(directory) !== path.join(root, 'styles')) {
    throw new Error(`Refusing to clean unexpected CSS output path: ${directory}`);
  }
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
}

fs.writeFileSync(path.join(sharedOutputDirectory, 'core-responsive.css'), sharedResponsiveCss);
fs.writeFileSync(path.join(sharedOutputDirectory, 'core-accessibility.css'), sharedAccessibilityCss);
console.log(`core-responsive.css: ${(Buffer.byteLength(sharedResponsiveCss) / 1024).toFixed(1)} KiB shared CSS`);
console.log(`core-accessibility.css: ${(Buffer.byteLength(sharedAccessibilityCss) / 1024).toFixed(1)} KiB shared CSS`);

for (const { html, htmlFile, htmlPath, pageName } of pages) {
  const pageScriptSources = htmlFile === 'prices.html'
    ? `${sharedScriptSources}\n${pricesScriptSource}`
    : htmlFile === 'analyses.html'
      ? `${sharedScriptSources}\n${analysesScriptSource}`
      : htmlFile === 'ultrasound.html'
        ? `${sharedScriptSources}\n${ultrasoundScriptSource}`
        : sharedScriptSources;
  const pageContent = [
    { raw: html, extension: 'html' },
    { raw: pageScriptSources, extension: 'js' }
  ];
  const pageCss = await purgeCss(readSources(pageMainSources), pageContent, `${pageName}-main`);
  const pageOverridesCss = await purgeCss(readSources(pageOverrideSources), pageContent, `${pageName}-overrides`);

  fs.writeFileSync(path.join(outputDirectory, `${pageName}.css`), pageCss);
  fs.writeFileSync(path.join(outputDirectory, `${pageName}-overrides.css`), pageOverridesCss);

  const stylesheetBlock = [
    `  <link rel="stylesheet" href="styles/pages/${pageName}.css?v=release3">`,
    '  <link rel="stylesheet" href="styles/dist/core-responsive.css?v=release3">',
    `  <link rel="stylesheet" href="styles/pages/${pageName}-overrides.css?v=release3">`,
    '  <link rel="stylesheet" href="styles/dist/core-accessibility.css?v=release3">'
  ].join('\n') + '\n';
  const updatedHtml = html.replace(
    /(?:  <link rel="stylesheet" href="styles\/(?:dist|pages)\/[^"]+\.css(?:\?[^"\s]+)?">\r?\n?)+/,
    stylesheetBlock
  );
  fs.writeFileSync(htmlPath, updatedHtml);
  const pageBytes = Buffer.byteLength(pageCss) + Buffer.byteLength(pageOverridesCss);
  console.log(`${htmlFile}: ${(pageBytes / 1024).toFixed(1)} KiB page CSS`);
}
