import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {map, of} from 'rxjs';
import {AsyncPipe, NgStyle} from '@angular/common';
import {ProjectsService} from '../../../core/services/projects.service';
import {SeoService} from '../../../core/services/seo.service';
import {SkillCategoryDto, SkillFullDto} from '../../../shared/models/skill-dtos';
import {SkillComponent} from '../../../shared/components/skill.component/skill.component';
import {TranslocoPipe} from '@jsverse/transloco';

/** Case-study sections in reading order: problem first, stack last. */
export const CASE_STUDY_SECTIONS: readonly string[] = [
  'overview',
  'features',
  'architecture',
  'deployment',
  'results',
  'technologies',
];

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslocoPipe,
    NgStyle,
    SkillComponent
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seo = inject(SeoService);

  readonly sections = CASE_STUDY_SECTIONS;

  readonly projects = inject(ProjectsService).getProjects();

  readonly project$ = this.route.paramMap.pipe(
    switchMap(params => {
      const slug = params.get('slug');
      if (!slug) return of(null);

      return this.projects.pipe(
        map(projects => projects.find(p => p.slug === slug) ?? null),
        tap(project => {
          if (project) {
            this.seo.setPage(project.titleKey, project.shortDescriptionKey);
          }
        })
      );
    })
  );

  readonly skills = this.project$.pipe(
    map(project =>
      (project?.skills ?? []).slice().sort((a, b) => {
        const orderDiff = a.category.displayOrder - b.category.displayOrder;
        return orderDiff !== 0
          ? orderDiff
          : a.nameKey.localeCompare(b.nameKey);
      })
    )
  );

  /** Skills grouped by area, in area display order (skills are already sorted by it). */
  readonly skillsByCategory = this.skills.pipe(
    map(skills => {
      const groups = new Map<string, { category: SkillCategoryDto; skills: SkillFullDto[] }>();

      for (const skill of skills) {
        const group = groups.get(skill.category.key) ?? { category: skill.category, skills: [] };
        group.skills.push(skill);
        groups.set(skill.category.key, group);
      }

      return [...groups.values()];
    })
  );

  onCloseClick(): void {
    void this.router.navigate(['/experience']);
  }
}
