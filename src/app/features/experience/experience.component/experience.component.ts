import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ExperienceService } from '../../../core/services/experience.service';
import { ExperienceFullDto } from '../../../shared/models/experience-dtos';
import { SkillComponent } from '../../../shared/components/skill.component/skill.component';
import { formatPeriod } from '../../../shared/utils/period';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [AsyncPipe, RouterLink, TranslocoPipe, SkillComponent],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  private transloco = inject(TranslocoService);

  readonly entries$ = inject(ExperienceService).getExperience();
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
