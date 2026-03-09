import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LearningSkillDto, LearningSkillFullDto, SkillCategoryDto, SkillDto,} from '../../shared/models/skill-dtos';
import {forkJoin, map, Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LearningSkillsService {
  private http = inject(HttpClient);

  private hydrateLearningSkill(learningSkill: LearningSkillDto, skills: SkillDto[], categories: SkillCategoryDto[]): LearningSkillFullDto | null {
    const skill = skills.find(s => s.key === learningSkill.skillKey);
    if (!skill) return null;

    const category = categories.find(c => c.key === skill.categoryKey);
    if (!category) return null;

    return { ...learningSkill, skill, category };
  }

  getLearningSkills(): Observable<LearningSkillFullDto[]> {
    return forkJoin({
      learningSkills: this.http.get<LearningSkillDto[]>('assets/data/learning-skills.json'),
      skills: this.http.get<SkillDto[]>('assets/data/skills.json'),
      categories: this.http.get<SkillCategoryDto[]>('assets/data/skill-categories.json')
    }).pipe(
      map(({ learningSkills, skills, categories }) =>
        learningSkills
          .map(ls => this.hydrateLearningSkill(ls, skills, categories))
          .filter(Boolean) as LearningSkillFullDto[]
      )
    );
  }
}
