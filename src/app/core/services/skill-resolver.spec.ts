import { resolveSkills } from './skill-resolver';
import { SkillCategoryDto, SkillDto } from '../../shared/models/skill-dtos';

const categories: SkillCategoryDto[] = [
  { key: 'backend', displayOrder: 1, nameKey: 'cat.backend', descriptionKey: 'cat.backend.d' },
];

const skills: SkillDto[] = [
  { key: 'csharp', nameKey: 's.csharp', descriptionKey: 's.csharp.d', categoryKey: 'backend' },
  { key: 'orphan', nameKey: 's.orphan', descriptionKey: 's.orphan.d', categoryKey: 'missing' },
];

describe('resolveSkills', () => {
  it('attaches the category to each referenced skill', () => {
    expect(resolveSkills([{ skillKey: 'csharp' }], skills, categories)).toEqual([
      { ...skills[0], category: categories[0] },
    ]);
  });

  it('keeps the order of the references', () => {
    const more: SkillDto[] = [
      ...skills,
      { key: 'sql', nameKey: 's.sql', descriptionKey: 's.sql.d', categoryKey: 'backend' },
    ];
    const result = resolveSkills([{ skillKey: 'sql' }, { skillKey: 'csharp' }], more, categories);
    expect(result.map((s) => s.key)).toEqual(['sql', 'csharp']);
  });

  it('drops references to unknown skills', () => {
    expect(resolveSkills([{ skillKey: 'nope' }], skills, categories)).toEqual([]);
  });

  it('drops skills whose category is unknown', () => {
    expect(resolveSkills([{ skillKey: 'orphan' }], skills, categories)).toEqual([]);
  });
});
