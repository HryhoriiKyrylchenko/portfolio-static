// Real site content, read from the source files so the tests follow content changes.
import { readFileSync } from 'node:fs';

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

export const en = json('src/assets/i18n/en.json');
export const pl = json('src/assets/i18n/pl.json');
export const projects: { slug: string; titleKey: string }[] = json('src/assets/data/projects.json');

/** Looks up "a.b.c" in a translation file. */
export const t = (lang: Record<string, unknown>, key: string): string =>
  key.split('.').reduce<any>((o, k) => o?.[k], lang);

export const SITE_URL = 'https://hryhoriikyrylchenko.dev';
export const SITE_NAME = 'Hryhorii Kyrylchenko';

/** Every page with the selector that shows its content has rendered. */
export const PAGES = [
  { path: '/', seo: 'home', ready: '.hero-name' },
  { path: '/about', seo: 'about', ready: '.skill-row' },
  { path: '/experience', seo: 'experience', ready: '.timeline-item' },
  { path: '/contacts', seo: 'contacts', ready: '.contact-data-list' },
  { path: '/privacy', seo: 'privacy', ready: '.privacy-page section' },
  { path: '/cookies', seo: 'cookies', ready: '.cookies-page section' },
  ...projects.map((p) => ({ path: `/projects/${p.slug}`, seo: null, ready: '.project-title' })),
];
