import {SkillFullDto, SkillRefDto} from './skill-dtos';

export interface ProjectDto {
  id: number;
  slug: string;
  coverImage: string;
  demoUrl: string;
  repoUrl: string;
  titleKey: string;
  shortDescriptionKey: string;
  descriptionSectionsKeys: Record<string, string>;
  skills: SkillRefDto[];
}

export interface ProjectFullDto extends Omit<ProjectDto, 'skills'> {
  skills: SkillFullDto[];
}
