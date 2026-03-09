import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectDto, ProjectFullDto} from '../../shared/models/project-dtos';
import {forkJoin, map, Observable} from 'rxjs';
import {SkillCategoryDto, SkillDto, SkillFullDto, SkillRefDto} from '../../shared/models/skill-dtos';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);

  private hydrateProject(project: ProjectDto, skills: SkillDto[], categories: SkillCategoryDto[]): ProjectFullDto {
    const skillMap = new Map(skills.map(s => [s.key, s]));
    const categoryMap = new Map(categories.map(c => [c.key, c]));

    const fullSkills: SkillFullDto[] = project.skills
      .map((ref: SkillRefDto) => {
        const skill = skillMap.get(ref.skillKey);
        if (!skill) return null;

        const category = categoryMap.get(skill.categoryKey);
        if (!category) return null;

        return { ...skill, category };
      })
      .filter(Boolean) as SkillFullDto[];

    return { ...project, skills: fullSkills };
  }

  getProjects(): Observable<ProjectFullDto[]> {
    return forkJoin({
      projects: this.http.get<ProjectDto[]>('assets/data/projects.json'),
      skills: this.http.get<SkillDto[]>('assets/data/skills.json'),
      categories: this.http.get<SkillCategoryDto[]>('assets/data/skill-categories.json'),
    }).pipe(
      map(({ projects, skills, categories }) =>
        projects.map(p => this.hydrateProject(p, skills, categories))
      )
    );
  }

  getLastProject(): Observable<ProjectFullDto | null> {
    return this.getProjects().pipe(
      map(projects => projects.length ? projects[projects.length - 1] : null)
    );
  }
}
