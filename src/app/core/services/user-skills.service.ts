import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import {
  SKILL_TIERS,
  SkillCategoryDto,
  SkillDto,
  UserSkillDto,
  UserSkillFullDto,
} from '../../shared/models/skill-dtos';
import { resolveSkills } from './skill-resolver';

@Injectable({ providedIn: 'root' })
export class UserSkillsService {
  private http = inject(HttpClient);

  /** User skills sorted by area, then tier, then name. Unresolved skill keys are dropped. */
  getUserSkills(): Observable<UserSkillFullDto[]> {
    return forkJoin({
      userSkills: this.http.get<UserSkillDto[]>('assets/data/user-skills.json'),
      skills: this.http.get<SkillDto[]>('assets/data/skills.json'),
      categories: this.http.get<SkillCategoryDto[]>('assets/data/skill-categories.json'),
    }).pipe(
      map(({ userSkills, skills, categories }) => {
        const resolved = new Map(resolveSkills(userSkills, skills, categories).map((s) => [s.key, s]));

        return userSkills
          .flatMap((us) => {
            const full = resolved.get(us.skillKey);
            return full ? [{ ...us, skill: full, category: full.category }] : [];
          })
          .sort(
            (a, b) =>
              a.category.displayOrder - b.category.displayOrder ||
              SKILL_TIERS.indexOf(a.tier) - SKILL_TIERS.indexOf(b.tier) ||
              a.skill.nameKey.localeCompare(b.skill.nameKey),
          );
      }),
    );
  }
}
