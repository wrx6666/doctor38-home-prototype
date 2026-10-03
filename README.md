# Doctor38 Home Prototype

Static HTML/CSS prototype for the redesigned `doctor38.ru` medical center website.

## Pages

- `index.html` - home page
- `services.html` - services catalog
- `prices.html` - prices
- `doctors.html` - doctors listing
- `about.html` - clinic information
- `contacts.html` - branches and contacts
- `documents.html` - licenses and documents
- `appointment.html` - appointment request page
- `droppers.html` - IV therapy programs and appointment entry point

## Run Locally

ES modules require the site to be served over HTTP. Opening an HTML file through
`file:///` disables page modules such as the doctors filters. Start the bundled
development server instead:

```bash
npm start
```

Then open `http://127.0.0.1:8088/index.html`.

To test the forms from another device on the same network, bind the server to
all local interfaces in PowerShell:

```powershell
$env:SITE_HOST = '0.0.0.0'
npm start
```

The forms automatically use `http://<current-host>:5500/api/v1` on localhost
and private-network addresses. Start the companion `express-doctor-master`
backend before submitting a form. In production, requests use the same-origin
path `/api/v1` and should be forwarded to the backend by the reverse proxy.

## JavaScript structure

- `site.js` - the single browser entry point
- `scripts/core/` - reusable browser infrastructure
- `scripts/features/` - shared site features
- `scripts/pages/` - page-specific behavior, loaded with dynamic imports only when its markup exists
- `scripts/data/` - structured page data

All HTML pages use ES modules and contain no inline JavaScript.

## Release assets and performance

Editable styles are split into ordered modules in `styles/source/`. The numeric filename prefixes preserve the CSS cascade. The build creates cacheable shared layers in `styles/dist/` and page-specific layers in `styles/pages/`; HTML loads them in source order. Do not edit generated files directly.
Images below the first screen use native lazy loading, responsive WebP sources, intrinsic dimensions and asynchronous decoding. The first meaningful image on image-led pages is preloaded and receives high fetch priority.
Icons are generated into `scripts/data/icon-definitions.js` and rendered as inline SVG paths; the site does not download the Font Awesome CDN stylesheet, icon fonts or external SVG fragments. Icon rendering and accessibility controls use classic deferred scripts so they also work when an HTML file is opened directly.

After changing image masters, icon usage, HTML or a file in `styles/source/`, rebuild the generated assets:

```bash
npm install
npm run prepare:release
```

The PDF files in `assets/documents/` are intentionally left unchanged and are downloaded only after a visitor opens a document link.

### Required before release

- Replace `assets/documents/personal-data-policy.docx` with the current, approved policy. The present file is a temporary outdated edition supplied for functional testing; keep the filename unchanged so all form and document-page links continue to work.

## Story viewer QA

Install the development dependency and run the visual check while the local site is available at port `8088`:

```bash
npm install
npm run qa:stories
```
