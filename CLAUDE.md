# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static, backend-free version of a personal portfolio site (live at https://hryhoriikyrylchenko.dev/). Angular 21 SPA with standalone components, no SSR, deployed to GitHub Pages. It is a cut-down port of a fullstack version (.NET backend, blog, admin panel) at https://github.com/HryhoriiKyrylchenko/personal-site; there is no API, and all content comes from JSON files under `src/assets/`.

## Commands

```bash
npm start              # ng serve dev server (http://localhost:4200)
npm run build          # production build (default configuration) -> dist/portfolio-static/browser
npm run watch          # development build in watch mode
npm test               # ng test: Vitest via @angular/build:unit-test, jsdom environment
npm run build:pages    # production build used by CI for GitHub Pages
npm run e2e            # build:pages, then Playwright end-to-end tests (desktop + mobile Chromium)
npx prettier --write <files>   # formatting (.prettierrc: printWidth 100, singleQuote, angular parser for .html)
```

- Specs sit next to the code as `*.spec.ts`. In CI and scripts run `npm test -- --watch=false`; to run a subset, use `ng test --include <glob>`. Shared fixtures and `translocoTesting()` (in-memory translations; a missing key renders as the key itself) are in `src/testing/`, which is excluded from the app build.
- `src/app/content.spec.ts` checks the real content files: en/pl key parity, every key referenced by the data, routes and templates (literal `'key' | transloco` uses), skill/slug references, date formats, and that `STATIC_ROUTES` in `scripts/spa-fallback.mjs` matches the routes with `data.seo`. It imports templates as text, so **add a new component's template to its `TEMPLATES` list**. When a content change breaks it, fix the data, not the test.
- End-to-end tests live in `e2e/` (Playwright, `playwright.config.ts`). They run against the Pages build served by `scripts/serve-pages.mjs`, which mimics GitHub Pages (`/x` → `x.html`, unknown → `404.html` with status 404). `hosting.spec.ts` checks raw HTTP: status codes, baked-in titles and canonical URLs, sitemap, robots and the CV; it runs on desktop only. `site.spec.ts` checks the running app at desktop and phone size: each page renders with no console errors, broken images or horizontal scroll, plus navigation, legacy redirects, language detection and switching, the cookie banner and the theme. Expected text is read from the i18n files. First-time setup: `npx playwright install chromium`.
- CI: `.github/workflows/test.yml` runs unit tests, the Pages build and the e2e tests on pull requests; the deploy workflow does the same before uploading, so a failure blocks the deploy.
- `.gitignore` ignores `*.d.ts` as compiler output; declarations under `src/` are excepted (`src/testing/text-imports.d.ts` is needed by the specs).
- No linter is configured (no ESLint).
- Deployment: every push to `main` runs `.github/workflows/deploy-pages.yml` (`npm ci` → `npm run build:pages` → upload `dist/portfolio-static/browser`). Pushing to `main` deploys the live site. After building, `build:pages` runs `scripts/spa-fallback.mjs`, which copies `index.html` to every known route (`<route>.html` and `<route>/index.html`, so deep links and refreshes return HTTP 200) and to `404.html` (unknown URLs return HTTP 404 and show `ErrorComponent`). Project routes come from `projects.json`, but **new top-level routes must also be added to `STATIC_ROUTES` in that script** (see SEO below). A plain `ng build` skips this step.
- Production budgets in `angular.json`: initial bundle warns at 500kB and fails at 1MB; **per-component styles warn at 4kB and fail at 8kB**. Large component SCSS will break the build, so move shared styles into `src/styles/`.

## Architecture

### Content is data plus translation keys
Content is stored in two layers:
1. **Structure** in `src/assets/data/*.json`: `experience.json` (timeline), `projects.json` (case studies), `skills.json`, `skill-categories.json`, `user-skills.json` (tier per skill: core/proficient/familiar), `credentials.json` (education and certifications), `spoken-languages.json`, and `pages/{privacy,cookies}.structure.json`. These files hold IDs, slugs, URLs, image paths and **translation keys**, not display text (e.g. `titleKey: "projects-list.forja.title"`, `descriptionSectionsKeys`, privacy section `title`/`paragraphs` are keys).
2. **Text** in `src/assets/i18n/{en,pl}.json`, resolved with Transloco at render time.

To add or change content, edit the structure JSON **and** add the matching keys to **both** i18n files (en, pl). A missing key falls back to `en` and is only logged in dev mode.

### Services hydrate references client-side
Services in `src/app/core/services/` reproduce the backend's joins. They fetch several JSON files with `forkJoin` and resolve references by key: `ProjectsService` and `ExperienceService` (both via `resolveSkills()` in `skill-resolver.ts`) map `skills[].skillKey` → `skills.json` → `categoryKey` → `skill-categories.json`, and `UserSkillsService` does the same for `user-skills.json`. Skill areas are the categories in `skill-categories.json`; the About skills matrix derives each skill's "used in" list from the `experience.json` entries that reference it (shown via their `shortTitleKey`). A reference that doesn't resolve is **silently dropped**, so check the keys when a skill doesn't show up. The DTO types are in `src/app/shared/models/`. `ExperienceService` sorts timeline entries newest first by `startDate`; an entry with `endDate: null` is ongoing, and `projectSlug` links it to its case study.

### App wiring (`src/app/app.config.ts`)
- Transloco with `availableLangs` en/pl. The language is persisted in a **cookie** (`cookiesStorageRoot()` in `shared/utils/cookie-storage.helper.ts`) and is chosen from the cookie, then the culture/browser language, then `en`. Detection is `resolveStartLang()` in `shared/utils/lang-detection.ts`. A `provideAppInitializer` loads the active translation before the first render. The language list is duplicated in `config/languages.config.ts` (`SUPPORTED_LANG_CODES`, also used by `app.config.ts`) and `transloco.config.ts`. Keep both in sync. A cached language that is no longer supported is ignored. `LanguageSwitcherComponent` only reflects and changes the active language (persist-lang writes the cookie on change); it must not set a language at startup, or it overrides detection. It migrates the legacy `preferred-language` localStorage value once.
- `LoadingInterceptor` (class-based, registered via `HTTP_INTERCEPTORS`) toggles `LoadingService` for every HTTP request, including i18n and data JSON loads. That drives the global spinner.
- Zone-based change detection (`provideZoneChangeDetection`).

### Routing (`src/app/app.routes.ts`)
Every page is a child of `LayoutComponent` (header, footer, cookies banner, back-to-top). `/experience` is the timeline; `/projects/:slug` is the lazy-loaded case study page. Legacy `/portfolio` and `/portfolio/:slug` redirect to them (and stay in `spa-fallback.mjs` so old links keep working). Unknown paths render `ErrorComponent` inside the layout.

### SEO
Page titles and descriptions are i18n keys under `seo.<key>`; routes opt in with `data: { seo: '<key>' }` (plus `noindex: true` for the error route). `SeoService` (started in `app.ts`) applies title, description, Open Graph/Twitter tags, canonical URL and `<html lang>` on every navigation and language change; project pages call `seo.setPage(titleKey, shortDescriptionKey)` once loaded. At build time `scripts/spa-fallback.mjs` writes the same English values into each route's HTML (for crawlers and link previews), marks legacy `/portfolio` URLs and `404.html` noindex, and generates `sitemap.xml` and `robots.txt`. It patches tags it finds in `src/index.html`, so keep those tags there. The Person JSON-LD block lives in `src/index.html`. A new page needs `seo.<key>` in both i18n files and an entry in `STATIC_ROUTES` (now a path → seo key map).

### Folder conventions
- `features/<area>/<name>.component/<name>.component.{ts,html,scss}`: page components; each component gets its own `*.component` folder.
- `shared/components/`: layout pieces. The header is split into `header-{mobile,tablet,desktop}.component`, and `HeaderComponent` switches between them with CDK `BreakpointObserver` using `shared/utils/custom-breakpoints.ts` (mobile ≤699px, tablet 700–1399px, desktop ≥1400px).
- `config/`: static config (languages, social links).

### Styling and theming
Global SCSS lives in `src/styles/` (abstracts/variables+mixins, base, components/button, themes) and is imported through `src/styles.scss` → `styles/main.scss`. Light/dark themes are selected by a `data-theme` attribute on `<body>`, which `ThemeService` sets and stores in `localStorage` under the key `theme`. Cookie consent is a `cookie_consent` cookie managed with `ngx-cookie-service` in `CookiesBannerComponent`.

### Static assets
`angular.json` copies `src/assets/**` to `/assets` (a `public/` input is also configured but the folder doesn't exist). The downloadable CV is in `src/assets/resume/`, and its path and download name are in `config/contact.config.ts` (`RESUME`, used by the home page), next to `CONTACT_EMAIL`. Update both values when replacing the PDF.
