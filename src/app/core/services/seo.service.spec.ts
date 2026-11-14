import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { SeoService, SITE_URL } from './seo.service';

@Component({ template: '' })
class BlankComponent {}

const seo = (title: string, description: string) => ({ title, description });

const en = {
  seo: {
    home: seo('Hryhorii Kyrylchenko | .NET Developer', 'Home description'),
    about: seo('About', 'About description'),
    error: seo('Not found', 'Error description'),
  },
  project: { title: 'Forja', short: 'Forja description' },
};

const pl = {
  seo: {
    home: seo('Hryhorii Kyrylchenko | Programista .NET', 'Opis strony głównej'),
    about: seo('O mnie', 'Opis o mnie'),
    error: seo('Nie znaleziono', 'Opis błędu'),
  },
  project: { title: 'Forja PL', short: 'Opis Forja' },
};

describe('SeoService', () => {
  let router: Router;
  let transloco: TranslocoService;

  const meta = (selector: string) =>
    document.head.querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content ?? null;
  const canonical = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;

  beforeEach(async () => {
    document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((el) => el.remove());

    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en, pl },
          translocoConfig: { availableLangs: ['en', 'pl'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideRouter([
          { path: '', component: BlankComponent, pathMatch: 'full', data: { seo: 'home' } },
          { path: 'about', component: BlankComponent, data: { seo: 'about' } },
          { path: 'projects/:slug', component: BlankComponent },
          { path: '**', component: BlankComponent, data: { seo: 'error', noindex: true } },
        ]),
      ],
    });

    router = TestBed.inject(Router);
    transloco = TestBed.inject(TranslocoService);
    TestBed.inject(SeoService).init();
  });

  it('uses the home title as-is, with a trailing-slash canonical URL', async () => {
    await router.navigateByUrl('/');
    expect(document.title).toBe('Hryhorii Kyrylchenko | .NET Developer');
    expect(meta('name="description"')).toBe('Home description');
    expect(canonical()).toBe(`${SITE_URL}/`);
  });

  it('suffixes other page titles with the site name', async () => {
    await router.navigateByUrl('/about');
    expect(document.title).toBe('About | Hryhorii Kyrylchenko');
    expect(meta('property="og:title"')).toBe('About | Hryhorii Kyrylchenko');
    expect(meta('name="twitter:title"')).toBe('About | Hryhorii Kyrylchenko');
    expect(meta('property="og:description"')).toBe('About description');
    expect(meta('name="twitter:description"')).toBe('About description');
  });

  it('builds the canonical URL without query, fragment or trailing slash', async () => {
    await router.navigateByUrl('/about/?utm_source=x#top');
    expect(canonical()).toBe(`${SITE_URL}/about`);
    expect(meta('property="og:url"')).toBe(`${SITE_URL}/about`);
  });

  it('keeps a single canonical link across navigations', async () => {
    await router.navigateByUrl('/');
    await router.navigateByUrl('/about');
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });

  it('marks noindex routes and clears the mark on the next page', async () => {
    await router.navigateByUrl('/missing');
    expect(document.title).toBe('Not found | Hryhorii Kyrylchenko');
    expect(meta('name="robots"')).toBe('noindex');

    await router.navigateByUrl('/about');
    expect(meta('name="robots"')).toBeNull();
  });

  it('updates text and <html lang> when the language changes', async () => {
    await router.navigateByUrl('/about');
    transloco.setActiveLang('pl');
    expect(document.documentElement.lang).toBe('pl');
    expect(document.title).toBe('O mnie | Hryhorii Kyrylchenko');
    expect(meta('name="description"')).toBe('Opis o mnie');
  });

  it('lets content pages set their own title, kept on language change', async () => {
    await router.navigateByUrl('/projects/forja');
    TestBed.inject(SeoService).setPage('project.title', 'project.short');
    expect(document.title).toBe('Forja | Hryhorii Kyrylchenko');
    expect(canonical()).toBe(`${SITE_URL}/projects/forja`);

    transloco.setActiveLang('pl');
    expect(document.title).toBe('Forja PL | Hryhorii Kyrylchenko');
  });
});
