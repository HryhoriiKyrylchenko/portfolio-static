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
- TypeScript
- SCSS
- GitHub Pages (static hosting)

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

- every known route (`about.html`, `portfolio/forja-platform/index.html`, …) so direct links and page refreshes return **HTTP 200**
- `404.html`, so unknown URLs still load the app (which shows its error page) with an **HTTP 404** status

Project routes come from `src/assets/data/projects.json`. When adding a new top-level page, add it to `STATIC_ROUTES` in `scripts/spa-fallback.mjs` as well as in `app.routes.ts`.


---

## 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---

## 👤 Author

Hryhorii Kyrylchenko

- GitHub: https://github.com/HryhoriiKyrylchenko
- LinkedIn: https://www.linkedin.com/in/hryhorii-kyrylchenko/
