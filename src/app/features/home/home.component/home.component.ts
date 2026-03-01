import {
  Component,
  inject,
} from '@angular/core';
import {map, take} from 'rxjs';
import {AsyncPipe, NgStyle} from '@angular/common';
import {Router} from '@angular/router';
import {SkillComponent} from '../../../shared/components/skill.component/skill.component';
import {ProjectsService} from '../../../core/services/projects.service';
import {UserSkillsService} from '../../../core/services/user-skills.service';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslocoPipe,
    SkillComponent,
    NgStyle,
    SkillComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private router = inject(Router);
  private projectsService = inject(ProjectsService);
  private userSkillsService = inject(UserSkillsService);

  readonly homeImageUrl = 'assets/images/home-image.jpg';

  readonly skills = this.userSkillsService.getUserSkills().pipe(
    map(skills => skills.sort((a, b) => {
      const orderDiff = a.category.displayOrder - b.category.displayOrder;
      return orderDiff !== 0
        ? orderDiff
        : a.skill.nameKey.localeCompare(b.skill.nameKey);
    }))
  );

  readonly project = this.projectsService.getLastProject();

  readonly projectSkills = this.project.pipe(
    map(project => project?.skills ?? [])
  );

  readonly resumeUrl = 'assets/data/resume/CV_Hryhorii_Kyrylchenko.pdf';

  onContactClick() {
    void this.router.navigate(['/contacts']);
  }

  onDownloadClick() {
    const link = document.createElement('a');
    link.href = this.resumeUrl;
    link.download = 'CV_Hryhorii_Kyrylchenko.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onPortfolioClick() {
    void this.router.navigate(['/portfolio']);
  }

  onReadClick() {
    this.project
      .pipe(take(1))
      .subscribe(project => {
        if (project?.slug) {
          void this.router.navigate(['/portfolio', project.slug]);
        }
      });
  }

  onRepoClick() {
    this.project
      .pipe(take(1))
      .subscribe(project => {
        if (project?.repoUrl && project.repoUrl.trim()) {
          window.open(project.repoUrl, '_blank');
        }
      });
  }

  onDemoClick() {
    this.project
      .pipe(take(1))
      .subscribe(project => {
        if (project?.demoUrl && project.demoUrl.trim()) {
          window.open(project.demoUrl, '_blank');
        }
      });
  }
}
