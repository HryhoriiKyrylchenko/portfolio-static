# Personal Portfolio (Static Version)

This repository contains the **static version** of my personal portfolio website.

It is built with Angular and deployed to **GitHub Pages** as a static Single Page Application (SPA).

> ⚠ This version does NOT include backend, admin panel, or dynamic blog functionality.

---

## 🌐 Live Website

🔗 https://hryhoriikyrylchenko.dev/

---

## 🏗 Original Fullstack Version

The original fullstack version (with .NET backend, blog, portfolio, admin panel with authentication) is available here:

🔗 https://github.com/HryhoriiKyrylchenko/personal-site

This static version was created to reduce hosting costs while keeping the project available as a portfolio showcase.

---

## ⚙ Tech Stack

- Angular (Standalone, no SSR)
- TypeScript, RxJS
- Transloco (English and Polish, browser-language detection)
- SCSS with light and dark themes
- GitHub Pages (static hosting), deployed by GitHub Actions

## 🧭 What's on the site

- **Home**: headline, current role, focus areas and contact links
- **Experience**: a timeline of work, internships, projects and education, with case studies at `/projects/<slug>`
- **About**: background, skills grouped by area with Core / Proficient / Familiar tiers and where each was used, education, certifications and languages
- **Contacts**, **Privacy Policy** and **Cookie Policy**

---

## 📦 Data Handling

All content is stored in local JSON files inside:

```
src/assets/data/
```


There is no backend API in this version.

---

## 🚀 Deployment

The site is deployed automatically by GitHub Actions (`.github/workflows/deploy-pages.yml`) on every push to `main`.

To build the same output locally:

```bash
npm run build:pages
```

Output: `dist/portfolio-static/browser`

### Deep links and page refresh

GitHub Pages has no server-side routing, so `build:pages` runs `scripts/spa-fallback.mjs` after the Angular build. The script copies `index.html` to:

- every known route (`about.html`, `projects/forja-platform/index.html`, …) so direct links and page refreshes return **HTTP 200**
- `404.html`, so unknown URLs still load the app (which shows its error page) with an **HTTP 404** status

Each copy gets its own title, description, canonical URL and Open Graph tags, so search engines and link previews see the right metadata without running JavaScript. Old `/portfolio/...` URLs redirect to the new pages and are marked `noindex`. The script also writes `sitemap.xml` and `robots.txt`.

Project routes come from `src/assets/data/projects.json`. When adding a new top-level page, add it to `STATIC_ROUTES` in `scripts/spa-fallback.mjs` (with its `seo.<key>` texts in both translation files) as well as in `app.routes.ts`.


---

## 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---

## 👤 Author

Hryhorii Kyrylchenko

- GitHub: https://github.com/HryhoriiKyrylchenko
- LinkedIn: https://www.linkedin.com/in/hryhorii-kyrylchenko/
