import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {switchMap, tap} from 'rxjs/operators';
import {map, of} from 'rxjs';
import {AsyncPipe, NgStyle} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {ProjectsService} from '../../../core/services/projects.service';
import {SkillFullDto} from '../../../shared/models/skill-dtos';
import {SkillComponent} from '../../../shared/components/skill.component/skill.component';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
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
  private titleService = inject(Title);

  readonly projects = inject(ProjectsService).getProjects();

  readonly project$ = this.route.paramMap.pipe(
    switchMap(params => {
      const slug = params.get('slug');
      if (!slug) return of(null);

      return this.projects.pipe(
        map(projects => projects.find(p => p.slug === slug) ?? null),
        tap(project => {
          if (project) {
            this.titleService.setTitle( project.title);
          }
        })
      );
    })
  );

  readonly skills$ = this.project$.pipe(
    map(project =>
      (project?.skills ?? []).slice().sort((a, b) => {
        const orderDiff = a.category.displayOrder - b.category.displayOrder;
        return orderDiff !== 0
          ? orderDiff
          : a.nameKey.localeCompare(b.nameKey);
      })
    )
  );

  readonly skillsByCategory$ = this.skills$.pipe(
    map(skills => {
      const grouped: Record<string, SkillFullDto[]> = {
        Languages: [],
        Tools: [],
        Frameworks: []
      };

      for (const skill of skills) {
        const key = skill.category.key;
        if (grouped[key]) {
          grouped[key].push(skill);
        }
      }

      return grouped;
    })
  );

  onCloseClick(): void {
    void this.router.navigate(['../'], { relativeTo: this.route });
  }
}
