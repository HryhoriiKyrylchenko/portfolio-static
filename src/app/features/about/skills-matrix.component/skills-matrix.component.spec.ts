import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SkillsMatrixComponent } from './skills-matrix.component';
import { UserSkillsService } from '../../../core/services/user-skills.service';
import { ExperienceService } from '../../../core/services/experience.service';
import { UserSkillFullDto } from '../../../shared/models/skill-dtos';
import { ExperienceFullDto } from '../../../shared/models/experience-dtos';
import { CATEGORIES, experience, SKILLS, translocoTesting } from '../../../../testing/fixtures';

const backend = CATEGORIES.find((c) => c.key === 'backend')!;
const frontend = CATEGORIES.find((c) => c.key === 'frontend')!;
const skill = (key: string) => SKILLS.find((s) => s.key === key)!;

// Already sorted by area, as UserSkillsService returns them.
const userSkills: UserSkillFullDto[] = [
  { skillKey: 'csharp', tier: 'core', skill: skill('csharp'), category: backend },
  { skillKey: 'sql', tier: 'familiar', skill: skill('sql'), category: backend },
  { skillKey: 'angular', tier: 'proficient', skill: skill('angular'), category: frontend },
];

const withSkills = (id: string, keys: string[]): ExperienceFullDto => ({
  ...experience({ id }),
  skills: keys.map((k) => ({ ...skill(k), category: backend })),
});

describe('SkillsMatrixComponent', () => {
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SkillsMatrixComponent, translocoTesting()],
      providers: [
        { provide: UserSkillsService, useValue: { getUserSkills: () => of(userSkills) } },
        {
          provide: ExperienceService,
          useValue: {
            getExperience: () =>
              of([withSkills('epam', ['csharp', 'sql']), withSkills('forja', ['csharp'])]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(SkillsMatrixComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const rows = () =>
    [...el.querySelectorAll('.skill-row')].map((row) => ({
      tier: row.querySelector('.tier')?.textContent?.trim(),
      usedIn: row.querySelector('.used-in')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    }));

  it('groups skills into areas in order', () => {
    const areas = [...el.querySelectorAll('.area-title')].map((h) => h.textContent?.trim());
    expect(areas).toEqual(['cat.backend', 'cat.frontend']);
    expect(el.querySelectorAll('.skill-area')[0].querySelectorAll('.skill-row').length).toBe(2);
  });

  it('shows each skill tier', () => {
    expect(rows().map((r) => r.tier)).toEqual(['skill.tier.core', 'skill.tier.familiar', 'skill.tier.proficient']);
  });

  it('lists the timeline entries that used each skill', () => {
    expect(rows().map((r) => r.usedIn)).toEqual([
      'skill.used_in: epam.short, forja.short',
      'skill.used_in: epam.short',
      null,
    ]);
  });
});
