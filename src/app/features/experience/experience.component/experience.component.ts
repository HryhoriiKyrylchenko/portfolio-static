import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ExperienceService } from '../../../core/services/experience.service';
import { ExperienceFullDto } from '../../../shared/models/experience-dtos';
import { SkillComponent } from '../../../shared/components/skill.component/skill.component';

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

  /** "Feb 2025 – May 2025" / "Feb 2025 – Present", localized. */
  formatPeriod(entry: ExperienceFullDto, lang: string): string {
    const end = entry.endDate
      ? this.formatMonth(entry.endDate, lang)
      : this.transloco.translate('experience.present');
    return `${this.formatMonth(entry.startDate, lang)} – ${end}`;
  }

  private formatMonth(yearMonth: string, lang: string): string {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' }).format(
      new Date(year, month - 1),
    );
  }
}
