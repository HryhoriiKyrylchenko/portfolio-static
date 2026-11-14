// The running site in a real browser, at desktop and phone sizes (see playwright.config.ts).
import { expect, Page, test } from '@playwright/test';
import { en, PAGES, pl, projects, t } from './content';

/** Collects console errors and uncaught exceptions for the whole test. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

async function acceptCookies(page: Page) {
  await page.context().addCookies([
    { name: 'cookie_consent', value: 'yes', url: test.info().project.use.baseURL! },
  ]);
}

const isMobile = () => test.info().project.name === 'mobile';

/** Opens the mobile menu if needed and follows a nav link. */
async function navigate(page: Page, label: string) {
  if (isMobile()) await page.locator('.mobile-nav-btn').click();
  const scope = isMobile() ? page.locator('.mobile-nav-modal') : page.locator('nav');
  await scope.getByRole('link', { name: label, exact: true }).click();
}

test.describe('pages', () => {
  test.beforeEach(({ page }) => acceptCookies(page));

  for (const { path, ready } of PAGES) {
    test(`${path} renders without errors or horizontal scroll`, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(path);
      await expect(page.locator(ready).first()).toBeVisible();

      // Every image loaded.
      const broken = await page
        .locator('img')
        .evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
      expect(broken).toEqual([]);

      // Nothing wider than the screen.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      expect(errors).toEqual([]);
    });
  }

  test('unknown URLs show the error page', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.locator('.error-page .title')).toHaveText(t(en, 'error.title'));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('legacy portfolio URLs redirect to the new pages', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveURL(/\/experience$/);
    await page.goto(`/portfolio/${projects[0].slug}`);
    await expect(page).toHaveURL(new RegExp(`/projects/${projects[0].slug}$`));
    await expect(page.locator('.project-title')).toBeVisible();
  });
});

test.describe('navigation', () => {
  test.beforeEach(({ page }) => acceptCookies(page));

  test('the header links reach every main page', async ({ page }) => {
    await page.goto('/');
    for (const [key, path] of [
      ['about', '/about'],
      ['experience', '/experience'],
      ['contacts', '/contacts'],
      ['home', '/'],
    ]) {
      await navigate(page, t(en, `nav.${key}`));
      await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/' : path}$`));
    }
  });

  test('a timeline entry opens its case study, and Back returns', async ({ page }) => {
    await page.goto('/experience');
    await page.locator('.timeline-link').first().click();
    await expect(page).toHaveURL(/\/projects\//);
    await expect(page.locator('.project-title')).toBeVisible();
    await expect(page).toHaveTitle(/\| Hryhorii Kyrylchenko$/);

    await page.getByRole('button', { name: t(en, 'button.back') }).click();
    await expect(page).toHaveURL(/\/experience$/);
  });
});

test.describe('language', () => {
  test.beforeEach(({ page }) => acceptCookies(page));

  test.describe('with a Polish browser', () => {
    test.use({ locale: 'pl-PL' });

    test('starts in Polish', async ({ page }) => {
      await page.goto('/about');
      await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
      await expect(page.locator('.about-title')).toHaveText(t(pl, 'about.title'));
      await expect(page).toHaveTitle(`${t(pl, 'seo.about.title')} | Hryhorii Kyrylchenko`);
    });
  });

  test('switching language updates the page and is remembered', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.about-title')).toHaveText(t(en, 'about.title'));

    await page.locator('app-language-switcher button.lang-switcher').click();
    await page.locator('.lang-menu li', { hasText: 'Polski' }).click();
    await expect(page.locator('.about-title')).toHaveText(t(pl, 'about.title'));
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

    await page.reload();
    await expect(page.locator('.about-title')).toHaveText(t(pl, 'about.title'));
  });
});

test.describe('preferences', () => {
  test('the cookie banner hides after accepting and stays hidden', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('.cookie-banner');
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: t(en, 'cookies.accept_button') }).click();
    await expect(banner).toBeHidden();

    await page.reload();
    await expect(page.locator('.hero-name')).toBeVisible();
    await expect(banner).toBeHidden();
  });

  test('the theme toggle switches to dark and is remembered', async ({ page }) => {
    await acceptCookies(page);
    await page.goto('/');
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');

    await page.getByRole('button', { name: t(en, 'a11y.theme') }).click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
  });
});
