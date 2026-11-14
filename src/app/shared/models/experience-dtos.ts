import { SkillFullDto, SkillRefDto } from './skill-dtos';

export type ExperienceType = 'work' | 'internship' | 'project' | 'education';

export interface ExperienceDto {
  id: string;
  type: ExperienceType;
  /** Display name of the company/school; not translated. Null for independent projects. */
  organization: string | null;
  /** "YYYY-MM" */
  startDate: string;
  /** "YYYY-MM", or null while ongoing. */
  endDate: string | null;
  titleKey: string;
  /** Short label used where space is tight, e.g. "used in" on the skills list. */
  shortTitleKey: string;
  summaryKey: string;
  highlightKeys: string[];
  /** Slug in projects.json; links the entry to its case study page. */
  projectSlug?: string;
  skills: SkillRefDto[];
}

export interface ExperienceFullDto extends Omit<ExperienceDto, 'skills'> {
  skills: SkillFullDto[];
}
