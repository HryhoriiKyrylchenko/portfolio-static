// Shared test data and helpers for specs.
import { HttpTestingController } from '@angular/common/http/testing';
import { Translation, TranslocoTestingModule } from '@jsverse/transloco';
import { SkillCategoryDto, SkillDto } from '../app/shared/models/skill-dtos';
import { ExperienceDto } from '../app/shared/models/experience-dtos';

export const CATEGORIES: SkillCategoryDto[] = [
  { key: 'frontend', displayOrder: 2, nameKey: 'cat.frontend', descriptionKey: 'cat.frontend.d' },
  { key: 'backend', displayOrder: 1, nameKey: 'cat.backend', descriptionKey: 'cat.backend.d' },
];

export const SKILLS: SkillDto[] = [
  { key: 'csharp', nameKey: 'skill.csharp', descriptionKey: 'd', categoryKey: 'backend' },
  { key: 'sql', nameKey: 'skill.sql', descriptionKey: 'd', categoryKey: 'backend' },
  { key: 'angular', nameKey: 'skill.angular', descriptionKey: 'd', categoryKey: 'frontend' },
];

export function experience(overrides: Partial<ExperienceDto> & Pick<ExperienceDto, 'id'>): ExperienceDto {
  return {
    type: 'project',
    organization: null,
    startDate: '2025-01',
    endDate: '2025-02',
    titleKey: `${overrides.id}.title`,
    shortTitleKey: `${overrides.id}.short`,
    summaryKey: `${overrides.id}.summary`,
    highlightKeys: [],
    skills: [],
    ...overrides,
  };
}

/** Answers the skills and categories requests that the hydrating services make. */
export function flushSkillData(http: HttpTestingController): void {
  http.expectOne('assets/data/skills.json').flush(SKILLS);
  http.expectOne('assets/data/skill-categories.json').flush(CATEGORIES);
}

/**
 * Transloco with in-memory translations. Keys that aren't given render as the key itself,
 * so templates can be checked against keys without loading the real i18n files.
 */
export function translocoTesting(langs: Record<string, Translation> = { en: {}, pl: {} }) {
  return TranslocoTestingModule.forRoot({
    langs,
    translocoConfig: { availableLangs: Object.keys(langs), defaultLang: 'en' },
    preloadLangs: true,
  });
}
