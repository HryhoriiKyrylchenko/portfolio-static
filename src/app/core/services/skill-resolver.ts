import { SkillCategoryDto, SkillDto, SkillFullDto, SkillRefDto } from '../../shared/models/skill-dtos';

/**
 * Resolves skill references against skills.json and skill-categories.json.
 * References that don't resolve are dropped.
 */
export function resolveSkills(
  refs: SkillRefDto[],
  skills: SkillDto[],
  categories: SkillCategoryDto[],
): SkillFullDto[] {
  const skillMap = new Map(skills.map((s) => [s.key, s]));
  const categoryMap = new Map(categories.map((c) => [c.key, c]));

  return refs.flatMap((ref) => {
    const skill = skillMap.get(ref.skillKey);
    const category = skill && categoryMap.get(skill.categoryKey);
    return skill && category ? [{ ...skill, category }] : [];
  });
}
