import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProjectDto, ProjectFullDto} from '../../shared/models/project-dtos';
import {forkJoin, map, Observable} from 'rxjs';
import {SkillCategoryDto, SkillDto} from '../../shared/models/skill-dtos';
import {resolveSkills} from './skill-resolver';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);

  private hydrateProject(project: ProjectDto, skills: SkillDto[], categories: SkillCategoryDto[]): ProjectFullDto {
    return { ...project, skills: resolveSkills(project.skills, skills, categories) };
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
