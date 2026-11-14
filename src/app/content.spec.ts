// Integrity checks for the real content files. The site has no backend, so a typo in a key or
// slug fails silently at runtime: unresolved skills are dropped, and a missing Polish
// translation falls back to English. These tests catch that at build time instead.
import { TestBed } from '@angular/core/testing';
import { Routes } from '@angular/router';

import en from '../assets/i18n/en.json';
import pl from '../assets/i18n/pl.json';
import experienceJson from '../assets/data/experience.json';
import projectsJson from '../assets/data/projects.json';
import skillsJson from '../assets/data/skills.json';
import categoriesJson from '../assets/data/skill-categories.json';
import userSkillsJson from '../assets/data/user-skills.json';
import credentialsJson from '../assets/data/credentials.json';
import spokenJson from '../assets/data/spoken-languages.json';
import privacyJson from '../assets/data/pages/privacy.structure.json';
import cookiesJson from '../assets/data/pages/cookies.structure.json';
// @ts-expect-error -- a JS file imported as text; TypeScript has no declaration for it.
import spaFallbackSource from '../../scripts/spa-fallback.mjs' with { loader: 'text' };

import { ExperienceDto } from './shared/models/experience-dtos';
import { ProjectDto } from './shared/models/project-dtos';
import { SKILL_TIERS, SkillCategoryDto, SkillDto, UserSkillDto } from './shared/models/skill-dtos';
import { CredentialDto, SpokenLanguageDto } from './shared/models/credential-dtos';
import { routes } from './app.routes';
import { CASE_STUDY_SECTIONS } from './features/projects/project.component/project.component';
import { LayoutComponent } from './shared/components/layout.component/layout.component';
import { SUPPORTED_LANG_CODES } from './config/languages.config';
import { translocoTesting } from '../testing/fixtures';

import appTpl from './app.html' with { loader: 'text' };
import aboutTpl from './features/about/about.component/about.component.html' with { loader: 'text' };
import credentialsTpl from './features/about/credentials.component/credentials.component.html' with { loader: 'text' };
import skillsMatrixTpl from './features/about/skills-matrix.component/skills-matrix.component.html' with { loader: 'text' };
import contactsTpl from './features/contacts/contacts.component/contacts.component.html' with { loader: 'text' };
import cookiesTpl from './features/cookies/cookies.component/cookies.component.html' with { loader: 'text' };
import errorTpl from './features/error/error.component/error.component.html' with { loader: 'text' };
import experienceTpl from './features/experience/experience.component/experience.component.html' with { loader: 'text' };
import homeTpl from './features/home/home.component/home.component.html' with { loader: 'text' };
import privacyTpl from './features/privacy/privacy.component/privacy.component.html' with { loader: 'text' };
import projectTpl from './features/projects/project.component/project.component.html' with { loader: 'text' };
import backToTopTpl from './shared/components/back-to-top.component/back-to-top.component.html' with { loader: 'text' };
import cookiesBannerTpl from './shared/components/cookies-banner.component/cookies-banner.component.html' with { loader: 'text' };
import footerLinksTpl from './shared/components/footer-links.component/footer-links.component.html' with { loader: 'text' };
import footerTpl from './shared/components/footer.component/footer.component.html' with { loader: 'text' };
import headerDesktopTpl from './shared/components/header.component/header-desktop.component.html' with { loader: 'text' };
import headerMobileTpl from './shared/components/header.component/header-mobile.component.html' with { loader: 'text' };
import headerTabletTpl from './shared/components/header.component/header-tablet.component.html' with { loader: 'text' };
import languageSwitcherTpl from './shared/components/language-switcher.component/language-switcher.component.html' with { loader: 'text' };
import layoutTpl from './shared/components/layout.component/layout.component.html' with { loader: 'text' };
import spinnerTpl from './shared/components/loading-spinner.component/loading-spinner.component.html' with { loader: 'text' };
import skillTpl from './shared/components/skill.component/skill.component.html' with { loader: 'text' };
import socialLinksTpl from './shared/components/social-links.component/social-links.component.html' with { loader: 'text' };
import themeToggleTpl from './shared/components/theme-toggle.component/theme-toggle.component.html' with { loader: 'text' };

/** Every component template. Add new templates here so their keys are checked too. */
const TEMPLATES: Record<string, string> = {
  appTpl, aboutTpl, credentialsTpl, skillsMatrixTpl, contactsTpl, cookiesTpl, errorTpl,
  experienceTpl, homeTpl, privacyTpl, projectTpl, backToTopTpl, cookiesBannerTpl, footerLinksTpl,
  footerTpl, headerDesktopTpl, headerMobileTpl, headerTabletTpl, languageSwitcherTpl, layoutTpl,
  spinnerTpl, skillTpl, socialLinksTpl, themeToggleTpl,
};

const experience = experienceJson as ExperienceDto[];
const projects = projectsJson as ProjectDto[];
const skills = skillsJson as SkillDto[];
const categories = categoriesJson as SkillCategoryDto[];
const userSkills = userSkillsJson as UserSkillDto[];
const credentials = credentialsJson as CredentialDto[];
const spoken = spokenJson as SpokenLanguageDto[];

type Tree = { [key: string]: Tree | string };

/** All leaf keys of a nested translation file, as "a.b.c" paths. */
function flatten(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(path, v);
    else flatten(v, path).forEach((value, key) => out.set(key, value));
  }
  return out;
}

const TRANSLATIONS = { en: flatten(en as Tree), pl: flatten(pl as Tree) };

/** Keys the content files point at, with where they came from (for readable failures). */
function referencedKeys(): Map<string, string> {
  const keys = new Map<string, string>();
  const add = (key: string, source: string) => keys.set(key, source);

  for (const e of experience) {
    for (const key of [e.titleKey, e.shortTitleKey, e.summaryKey, ...e.highlightKeys]) add(key, `experience ${e.id}`);
    add(`experience.type.${e.type}`, `experience ${e.id}`);
  }
  for (const p of projects) {
    for (const key of [p.titleKey, p.shortDescriptionKey, ...Object.values(p.descriptionSectionsKeys)]) {
      add(key, `project ${p.slug}`);
    }
    for (const section of Object.keys(p.descriptionSectionsKeys)) add(`project.${section}`, `project ${p.slug}`);
  }
  for (const s of skills) for (const key of [s.nameKey, s.descriptionKey]) add(key, `skill ${s.key}`);
  for (const c of categories) for (const key of [c.nameKey, c.descriptionKey]) add(key, `category ${c.key}`);
  for (const tier of new Set(userSkills.map((u) => u.tier))) add(`skill.tier.${tier}`, 'user-skills');
  for (const c of credentials) {
    add(c.titleKey, `credential ${c.id}`);
    add(`credentials.${c.type}`, `credential ${c.id}`);
  }
  for (const l of spoken) {
    add(`spoken.${l.code}`, 'spoken-languages');
    if (l.level === 'native') add('spoken.native', 'spoken-languages');
  }
  for (const [page, sections] of [
    ['privacy', privacyJson.privacy.sections],
    ['cookies', cookiesJson.cookies.sections],
  ] as const) {
    for (const s of sections) for (const key of [s.title, ...s.paragraphs]) add(key, `${page} page`);
  }
  for (const key of seoKeys()) {
    add(`seo.${key}.title`, 'routes');
    add(`seo.${key}.description`, 'routes');
  }
  for (const [name, tpl] of Object.entries(TEMPLATES)) {
    // Literal keys only: skip the tail of a concatenation such as `'a.' + x + '.title' | transloco`.
    for (const [, key] of tpl.matchAll(/(?<!\+\s*)'(\w[\w.-]*)'\s*\|\s*transloco/g)) add(key, name);
  }
  // Keys built in templates from a prefix plus a value are covered above from the data
  // (experience.type., credentials., spoken., skill.tier., project.); these two are fixed lists.
  for (const area of ['api', 'data', 'quality']) {
    add(`home.focus.${area}.title`, 'home');
    add(`home.focus.${area}.text`, 'home');
  }
  add('experience.present', 'period labels');
  return keys;
}

function seoKeys(): string[] {
  const out: string[] = [];
  const walk = (rs: Routes) =>
    rs.forEach((r) => {
      if (typeof r.data?.['seo'] === 'string') out.push(r.data['seo']);
      if (r.children) walk(r.children);
    });
  walk(routes);
  return out;
}

const spaFallback: string = spaFallbackSource;

const duplicates = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);

describe('content', () => {
  describe('translations', () => {
    it('has a file for every supported language', () => {
      expect(Object.keys(TRANSLATIONS).sort()).toEqual([...SUPPORTED_LANG_CODES].sort());
    });

    it('has the same keys in English and Polish', () => {
      const enKeys = [...TRANSLATIONS.en.keys()];
      const plKeys = [...TRANSLATIONS.pl.keys()];
      expect(enKeys.filter((k) => !TRANSLATIONS.pl.has(k)), 'missing in pl.json').toEqual([]);
      expect(plKeys.filter((k) => !TRANSLATIONS.en.has(k)), 'missing in en.json').toEqual([]);
    });

    it('has no empty translations', () => {
      for (const [lang, map] of Object.entries(TRANSLATIONS)) {
        const empty = [...map].filter(([, v]) => !v.trim()).map(([k]) => k);
        expect(empty, `empty values in ${lang}.json`).toEqual([]);
      }
    });

    it('defines every key that the data, routes and templates use', () => {
      for (const [lang, map] of Object.entries(TRANSLATIONS)) {
        const missing = [...referencedKeys()].filter(([key]) => !map.has(key)).map(([k, from]) => `${k} (${from})`);
        expect(missing, `missing in ${lang}.json`).toEqual([]);
      }
    });

    it('defines the nav link labels', () => {
      TestBed.configureTestingModule({ imports: [translocoTesting()] });
      const layout = TestBed.runInInjectionContext(() => new LayoutComponent());
      for (const map of Object.values(TRANSLATIONS)) {
        expect(layout.links.map((l) => l.textKey).filter((k) => !map.has(k))).toEqual([]);
      }
    });
  });

  describe('skills', () => {
    const skillKeys = new Set(skills.map((s) => s.key));

    it('have unique keys', () => {
      expect(duplicates(skills.map((s) => s.key))).toEqual([]);
      expect(duplicates(categories.map((c) => c.key))).toEqual([]);
      expect(duplicates(userSkills.map((u) => u.skillKey))).toEqual([]);
    });

    it('belong to existing categories', () => {
      const categoryKeys = new Set(categories.map((c) => c.key));
      expect(skills.filter((s) => !categoryKeys.has(s.categoryKey)).map((s) => s.key)).toEqual([]);
    });

    it('are all referenced with existing keys', () => {
      const refs = [
        ...userSkills.map((u) => [u.skillKey, 'user-skills']),
        ...experience.flatMap((e) => e.skills.map((s) => [s.skillKey, `experience ${e.id}`])),
        ...projects.flatMap((p) => p.skills.map((s) => [s.skillKey, `project ${p.slug}`])),
      ];
      expect(refs.filter(([key]) => !skillKeys.has(key)).map(([k, from]) => `${k} (${from})`)).toEqual([]);
    });

    it('use a known tier', () => {
      expect(userSkills.filter((u) => !SKILL_TIERS.includes(u.tier))).toEqual([]);
    });
  });

  describe('experience', () => {
    const month = /^\d{4}-(0[1-9]|1[0-2])$/;

    it('has unique ids', () => {
      expect(duplicates(experience.map((e) => e.id))).toEqual([]);
    });

    it('uses YYYY-MM dates with the end after the start', () => {
      for (const e of experience) {
        expect(e.startDate, e.id).toMatch(month);
        if (e.endDate !== null) {
          expect(e.endDate, e.id).toMatch(month);
          expect(e.endDate >= e.startDate, `${e.id} ends before it starts`).toBe(true);
        }
      }
    });

    it('links only to existing case studies', () => {
      const slugs = new Set(projects.map((p) => p.slug));
      expect(experience.filter((e) => e.projectSlug && !slugs.has(e.projectSlug)).map((e) => e.id)).toEqual([]);
    });
  });

  describe('projects', () => {
    it('have unique ids and URL-safe slugs', () => {
      expect(duplicates(projects.map((p) => String(p.id)))).toEqual([]);
      expect(duplicates(projects.map((p) => p.slug))).toEqual([]);
      for (const p of projects) expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it('use only sections the case study page renders', () => {
      for (const p of projects) {
        const unknown = Object.keys(p.descriptionSectionsKeys).filter((s) => !CASE_STUDY_SECTIONS.includes(s));
        expect(unknown, p.slug).toEqual([]);
      }
    });
  });

  describe('credentials', () => {
    it('link only over HTTPS', () => {
      expect(credentials.filter((c) => c.url !== null && !c.url.startsWith('https://')).map((c) => c.id)).toEqual([]);
    });
  });

  describe('pre-rendered routes (scripts/spa-fallback.mjs)', () => {
    const block = spaFallback.match(/const STATIC_ROUTES = \{([\s\S]*?)\};/)?.[1] ?? '';
    const staticRoutes = Object.fromEntries(
      [...block.matchAll(/^\s*'?([\w/-]+)'?\s*:\s*'([\w-]+)'/gm)].map(([, path, key]) => [path, key]),
    );

    it('can be read from the script', () => {
      expect(Object.keys(staticRoutes).length).toBeGreaterThan(0);
    });

    it('include every page route with SEO data, using the same SEO key', () => {
      const pages = (routes[0].children ?? []).filter(
        (r) => r.path && r.path !== '**' && typeof r.data?.['seo'] === 'string',
      );
      expect(Object.fromEntries(pages.map((r) => [r.path, r.data!['seo']]))).toEqual(staticRoutes);
    });
  });
});
