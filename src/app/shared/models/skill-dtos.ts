export interface SkillDto {
  key: string;
  nameKey: string;
  descriptionKey: string;
  categoryKey: string;
}

export interface SkillCategoryDto {
  key: string;
  displayOrder: number;
  nameKey: string;
  descriptionKey: string;
}

export interface UserSkillDto {
  skillKey: string;
  proficiency: number;
}

export interface LearningSkillDto {
  skillKey: string;
  learningStatus: string;
  displayOrder: number;
}

export interface SkillRefDto {
  skillKey: string;
}

export interface SkillFullDto extends SkillDto {
  category: SkillCategoryDto;
}

export interface UserSkillFullDto extends UserSkillDto {
  skill: SkillDto;
  category: SkillCategoryDto;
}

export interface LearningSkillFullDto {
  skill: SkillDto;
  category: SkillCategoryDto;
  learningStatus: string;
  displayOrder: number;
}
