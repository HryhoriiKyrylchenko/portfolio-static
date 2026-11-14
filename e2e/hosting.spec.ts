// What GitHub Pages serves before any JavaScript runs: status codes, the SEO tags baked in by
// scripts/spa-fallback.mjs, sitemap, robots and the CV. Crawlers and link previews see this.
import { expect, test } from '@playwright/test';
import { en, PAGES, projects, SITE_NAME, SITE_URL, t } from './content';

const tag = (html: string, pattern: RegExp) => html.match(pattern)?.[1];

test.describe('hosting', () => {
  for (const page of PAGES) {
    test(`${page.path} returns 200 with its own title and canonical URL`, async ({ request }) => {
      const res = await request.get(page.path);
      expect(res.status()).toBe(200);
      const html = await res.text();

      const project = projects.find((p) => page.path === `/projects/${p.slug}`);
      const expectedTitle =
        page.seo === 'home'
          ? t(en, 'seo.home.title')
          : `${project ? t(en, project.titleKey) : t(en, `seo.${page.seo}.title`)} | ${SITE_NAME}`;
      const canonical = page.path === '/' ? `${SITE_URL}/` : SITE_URL + page.path;

      expect(tag(html, /<title>([^<]*)<\/title>/)).toBe(expectedTitle.replace(/&/g, '&amp;'));
      expect(tag(html, /<link rel="canonical" href="([^"]*)"/)).toBe(canonical);
      expect(tag(html, /<meta property="og:url" content="([^"]*)"/)).toBe(canonical);
      expect(html).not.toContain('name="robots" content="noindex"');
    });
  }

  test('a trailing slash serves the same page', async ({ request }) => {
    expect((await request.get('/about/')).status()).toBe(200);
  });

  test('unknown URLs return 404 and are not indexed', async ({ request }) => {
    const res = await request.get('/no-such-page');
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('name="robots" content="noindex"');
  });

  test('legacy portfolio URLs still load but are not indexed', async ({ request }) => {
    for (const path of ['/portfolio', ...projects.map((p) => `/portfolio/${p.slug}`)]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(await res.text(), path).toContain('name="robots" content="noindex"');
    }
  });

  test('the sitemap lists every page', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const expected = PAGES.map((p) => SITE_URL + p.path).sort();
    expect(locs).toEqual(expected);
  });

  test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Allow: /');
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('the CV linked in the header is a PDF', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.locator('a[download]').first().getAttribute('href');
    expect(href).toBeTruthy();
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('application/pdf');
  });
});
