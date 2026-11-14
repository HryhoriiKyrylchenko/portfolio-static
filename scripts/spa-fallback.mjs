// Post-build step for GitHub Pages (run by `npm run build:pages`).
//
// GitHub Pages only returns 200 for files that exist. To make deep links and page refreshes
// work with a correct status code, this writes a copy of the built index.html for every known
// route:
//   - <route>.html        -> served for /<route> without a trailing-slash redirect
//   - <route>/index.html  -> served for /<route>/
// Unknown URLs fall back to 404.html (also a copy of index.html), so the SPA renders its
// ErrorComponent while GitHub Pages correctly responds with 404.
//
// Each copy gets its own <title>, description, canonical URL and Open Graph/Twitter tags
// (English texts from src/assets/i18n/en.json, keys under `seo.`), so crawlers and link
// previews that don't run JavaScript see the right metadata. SeoService applies the same
// values at runtime. Legacy /portfolio URLs and 404.html are marked noindex.
// Also writes sitemap.xml and robots.txt.
//
// Keep STATIC_ROUTES in sync with src/app/app.routes.ts. Project routes are read from
// src/assets/data/projects.json, so new projects are picked up automatically.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DIST = 'dist/portfolio-static/browser';
const SITE_URL = 'https://hryhoriikyrylchenko.dev';
const SITE_NAME = 'Hryhorii Kyrylchenko';

// Route path -> key under `seo.` in en.json.
const STATIC_ROUTES = {
  about: 'about',
  experience: 'experience',
  contacts: 'contacts',
  privacy: 'privacy',
  cookies: 'cookies',
};

const en = JSON.parse(readFileSync('src/assets/i18n/en.json', 'utf8'));
const projects = JSON.parse(readFileSync('src/assets/data/projects.json', 'utf8'));
const t = (key) => {
  const value = key.split('.').reduce((o, k) => o?.[k], en);
  if (typeof value !== 'string') throw new Error(`Missing en translation: ${key}`);
  return value;
};

const pageTitle = (title) => `${title} | ${SITE_NAME}`;

/** @type {{ path: string, title: string, description: string, canonical: string, noindex?: boolean }[]} */
const pages = [
  ...Object.entries(STATIC_ROUTES).map(([path, key]) => ({
    path,
    title: pageTitle(t(`seo.${key}.title`)),
    description: t(`seo.${key}.description`),
    canonical: `${SITE_URL}/${path}`,
  })),
  ...projects.map((p) => ({
    path: `projects/${p.slug}`,
    title: pageTitle(t(p.titleKey)),
    description: t(p.shortDescriptionKey),
    canonical: `${SITE_URL}/projects/${p.slug}`,
  })),
];

// Legacy URLs: the SPA redirects them; point crawlers at the new pages.
const legacy = [
  { path: 'portfolio', target: 'experience' },
  ...projects.map((p) => ({ path: `portfolio/${p.slug}`, target: `projects/${p.slug}` })),
].map(({ path, target }) => ({ ...pages.find((p) => p.path === target), path, noindex: true }));

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const index = readFileSync(join(DIST, 'index.html'), 'utf8');

function render({ title, description, canonical, noindex }) {
  const replacements = [
    [/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`],
    [/(<meta name="description" content=")[^"]*(")/, `$1${escape(description)}$2`],
    [/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`],
    [/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(title)}$2`],
    [/(<meta property="og:description" content=")[^"]*(")/, `$1${escape(description)}$2`],
    [/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`],
    [/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escape(title)}$2`],
    [/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escape(description)}$2`],
  ];
  let html = index;
  for (const [pattern, value] of replacements) {
    if (!pattern.test(html)) throw new Error(`index.html is missing a tag for ${pattern}`);
    html = html.replace(pattern, value);
  }
  if (noindex) html = html.replace('</head>', '  <meta name="robots" content="noindex">\n</head>');
  return html;
}

const write = (target, content) => {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
};

for (const page of [...pages, ...legacy]) {
  const html = render(page);
  write(join(DIST, `${page.path}.html`), html);
  write(join(DIST, page.path, 'index.html'), html);
}

write(
  join(DIST, '404.html'),
  render({
    title: pageTitle(t('seo.error.title')),
    description: t('seo.error.description'),
    canonical: `${SITE_URL}/`,
    noindex: true,
  }),
);

const lastmod = new Date().toISOString().slice(0, 10);
const urls = ['', ...pages.map((p) => p.path)];
write(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}/${u}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>
`,
);
write(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(
  `SPA fallback: 404.html + ${pages.length} pages + ${legacy.length} legacy redirects, sitemap.xml, robots.txt`,
);
