import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ExperienceService } from '../../../core/services/experience.service';
import { SkillComponent } from '../../../shared/components/skill.component/skill.component';
import { ExperienceFullDto } from '../../../shared/models/experience-dtos';
import { formatPeriod } from '../../../shared/utils/period';
import { CONTACT_EMAIL, RESUME } from '../../../config/contact.config';
import { SOCIAL_LINKS } from '../../../config/social-links.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, RouterLink, TranslocoPipe, SkillComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private transloco = inject(TranslocoService);

  readonly homeImageUrl = 'assets/images/home_image.jpg';
  readonly resume = RESUME;
  readonly email = CONTACT_EMAIL;
  readonly linkedInUrl = SOCIAL_LINKS.find((l) => l.platform === 'LinkedIn')?.url;

  /** Keys under `home.focus.` in the i18n files; each has a title and text. */
  readonly focusAreas = ['api', 'data', 'quality'];

  readonly current$ = inject(ExperienceService).getCurrent();
  readonly lang$ = this.transloco.langChanges$;

  formatPeriod(entry: ExperienceFullDto, lang: string): string {
    return formatPeriod(
      entry.startDate,
      entry.endDate,
      lang,
      this.transloco.translate('experience.present'),
    );
  }
}
