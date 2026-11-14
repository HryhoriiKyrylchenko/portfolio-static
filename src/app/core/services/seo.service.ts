import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { combineLatest, filter, map, startWith } from 'rxjs';

export const SITE_URL = 'https://hryhoriikyrylchenko.dev';
const SITE_NAME = 'Hryhorii Kyrylchenko';

/** Route `data.seo`: a key under `seo.` in the i18n files (with `title` and `description`). */
export interface SeoRouteData {
  seo?: string;
  noindex?: boolean;
}

interface SeoKeys {
  titleKey: string;
  descriptionKey: string;
  /** Home page: use the title as-is instead of "<title> | <site name>". */
  standalone?: boolean;
  noindex?: boolean;
}

/**
 * Keeps <title>, description, Open Graph/Twitter tags, canonical URL, robots and <html lang>
 * in sync with the current route and language. The same values for English are baked into
 * each route's HTML at build time by scripts/spa-fallback.mjs, for crawlers and link previews.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private document = inject(DOCUMENT);
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private transloco = inject(TranslocoService);

  private pageKeys: SeoKeys | null = null;

  init(): void {
    const navigation$ = this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.deepestRoute().snapshot.data as SeoRouteData),
      startWith(this.deepestRoute().snapshot.data as SeoRouteData),
    );

    combineLatest([navigation$, this.transloco.langChanges$]).subscribe(([data, lang]) => {
      this.document.documentElement.lang = lang;
      // Routes without `seo` data (project pages) call setPage() once their content loads.
      if (data.seo) {
        this.pageKeys = {
          titleKey: `seo.${data.seo}.title`,
          descriptionKey: `seo.${data.seo}.description`,
          standalone: data.seo === 'home',
          noindex: data.noindex,
        };
      }
      this.apply();
    });

    // Translations can finish loading after navigation; re-apply when they do.
    this.transloco.events$
      .pipe(filter((e) => e.type === 'translationLoadSuccess'))
      .subscribe(() => this.apply());
  }

  /** For pages whose title comes from loaded content, e.g. project case studies. */
  setPage(titleKey: string, descriptionKey: string): void {
    this.pageKeys = { titleKey, descriptionKey };
    this.apply();
  }

  private apply(): void {
    if (!this.pageKeys) return;
    const { titleKey, descriptionKey, standalone, noindex } = this.pageKeys;

    const pageTitle = this.transloco.translate(titleKey);
    const title = standalone ? pageTitle : `${pageTitle} | ${SITE_NAME}`;
    const description = this.transloco.translate(descriptionKey);
    // Home is "https://…/"; other pages have no trailing slash (matches spa-fallback.mjs).
    const path = this.router.url.split(/[?#]/)[0].replace(/\/$/, '');
    const url = path ? SITE_URL + path : `${SITE_URL}/`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.meta.removeTag('name="robots"');
    }

    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private deepestRoute(): ActivatedRoute {
    let route = this.route;
    while (route.firstChild) route = route.firstChild;
    return route;
  }
}
