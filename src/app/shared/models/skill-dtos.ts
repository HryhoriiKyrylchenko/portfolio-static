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

/** Self-assessed depth, in display order. */
export const SKILL_TIERS = ['core', 'proficient', 'familiar'] as const;
export type SkillTier = (typeof SKILL_TIERS)[number];

export interface UserSkillDto {
  skillKey: string;
  tier: SkillTier;
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
