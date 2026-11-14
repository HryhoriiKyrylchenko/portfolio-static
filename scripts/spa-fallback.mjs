// Post-build step for GitHub Pages (run by `npm run build:pages`).
//
// GitHub Pages only returns 200 for files that exist. To make deep links and page refreshes
// work with a correct status code, this copies the built index.html to every known route:
//   - <route>.html        -> served for /<route> without a trailing-slash redirect
//   - <route>/index.html  -> served for /<route>/
// Unknown URLs fall back to 404.html (also a copy of index.html), so the SPA renders its
// ErrorComponent while GitHub Pages correctly responds with 404.
//
// Keep STATIC_ROUTES in sync with src/app/app.routes.ts. Project routes are read from
// src/assets/data/projects.json, so new projects are picked up automatically.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DIST = 'dist/portfolio-static/browser';
// 'portfolio' and 'portfolio/<slug>' are legacy URLs; the SPA redirects them to the new routes.
const STATIC_ROUTES = ['about', 'experience', 'contacts', 'privacy', 'cookies', 'portfolio'];

const projects = JSON.parse(readFileSync('src/assets/data/projects.json', 'utf8'));
const routes = [
  ...STATIC_ROUTES,
  ...projects.flatMap((p) => [`projects/${p.slug}`, `portfolio/${p.slug}`]),
];

const index = join(DIST, 'index.html');
const copy = (target) => {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(index, target);
};

copy(join(DIST, '404.html'));
for (const route of routes) {
  copy(join(DIST, `${route}.html`));
  copy(join(DIST, route, 'index.html'));
}

console.log(`SPA fallback: 404.html + ${routes.length} routes (${routes.join(', ')})`);
