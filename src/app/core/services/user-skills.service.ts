import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { SkillDto, SkillCategoryDto, UserSkillDto, UserSkillFullDto } from '../../shared/models/skill-dtos';

@Injectable({ providedIn: 'root' })
export class UserSkillsService {
  private http = inject(HttpClient);

  private hydrateUserSkill(userSkill: UserSkillDto, skills: SkillDto[], categories: SkillCategoryDto[]): UserSkillFullDto | null {
    const skill = skills.find(s => s.key === userSkill.skillKey);
    if (!skill) return null;

    const category = categories.find(c => c.key === skill.categoryKey);
    if (!category) return null;

    return { ...userSkill, skill, category };
  }

  getUserSkills(): Observable<UserSkillFullDto[]> {
    return forkJoin({
      userSkills: this.http.get<UserSkillDto[]>('assets/data/user-skills.json'),
      skills: this.http.get<SkillDto[]>('assets/data/skills.json'),
      categories: this.http.get<SkillCategoryDto[]>('assets/data/skill-categories.json')
    }).pipe(
      map(({ userSkills, skills, categories }) =>
        userSkills
          .map(us => this.hydrateUserSkill(us, skills, categories))
          .filter(Boolean) as UserSkillFullDto[]
      )
    );
  }
}
