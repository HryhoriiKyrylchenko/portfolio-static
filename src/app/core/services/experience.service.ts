import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { ExperienceDto, ExperienceFullDto } from '../../shared/models/experience-dtos';
import { SkillCategoryDto, SkillDto } from '../../shared/models/skill-dtos';
import { resolveSkills } from './skill-resolver';

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  private http = inject(HttpClient);

  /** Timeline entries, newest first (ongoing entries before finished ones with the same start). */
  getExperience(): Observable<ExperienceFullDto[]> {
    return forkJoin({
      entries: this.http.get<ExperienceDto[]>('assets/data/experience.json'),
      skills: this.http.get<SkillDto[]>('assets/data/skills.json'),
      categories: this.http.get<SkillCategoryDto[]>('assets/data/skill-categories.json'),
    }).pipe(
      map(({ entries, skills, categories }) =>
        entries
          .map((e) => ({ ...e, skills: resolveSkills(e.skills, skills, categories) }))
          .sort(
            (a, b) =>
              b.startDate.localeCompare(a.startDate) ||
              (b.endDate ?? '9999').localeCompare(a.endDate ?? '9999'),
          ),
      ),
    );
  }

  /** The most recent entry, used for the "currently" block on the home page. */
  getCurrent(): Observable<ExperienceFullDto | null> {
    return this.getExperience().pipe(map((entries) => entries[0] ?? null));
  }
}
