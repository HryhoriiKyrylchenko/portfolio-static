import {Component, DOCUMENT, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {map} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ProjectsService} from '../../../core/services/projects.service';
import {SkillComponent} from '../../../shared/components/skill.component/skill.component';
import {ProjectFullDto} from '../../../shared/models/project-dtos';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, RouterOutlet, SkillComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly projectService = inject(ProjectsService);
  private document = inject(DOCUMENT);

  readonly projects$ = this.projectService.getProjects().pipe(
    map(projects =>
      projects.map(project => ({
        ...project,
        skills: [...project.skills].sort((a, b) => {
          const orderDiff = a.category.displayOrder - b.category.displayOrder;
          return orderDiff !== 0
            ? orderDiff
            : a.nameKey.localeCompare(b.nameKey);
        })
      }))
    )
  );

  hasDetail = false;

  expandedProjectId?: number;
  private hoverTimeout?: ReturnType<typeof setTimeout>;

  onMouseEnter(projectId: number) {
    this.hoverTimeout = setTimeout(() => {
      this.expandedProjectId = projectId;
    }, 1000);
  }

  onMouseLeave() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = undefined;
    }
    this.expandedProjectId = undefined;
  }

  ngOnInit() {
    this.updateHasDetail();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.updateHasDetail();
    });
  }

  private updateHasDetail() {
    const child = this.route.firstChild;
    this.hasDetail = !!(child && child.snapshot.paramMap.get('slug'));
  }

  trackBySlug(_: number, project: ProjectFullDto): string {
    return project.slug;
  }

  onReadClick(slug: string) {
    void this.router.navigate([slug], { relativeTo: this.route });
  }

  currentFullUrl(slug: string): string {
    const urlTree = this.router.createUrlTree([slug], { relativeTo: this.route });
    const path = this.router.serializeUrl(urlTree);
    return `${this.document.location.origin}${path}`;
  }
}
