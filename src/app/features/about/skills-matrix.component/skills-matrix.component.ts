import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { forkJoin, map } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { UserSkillsService } from '../../../core/services/user-skills.service';
import { ExperienceService } from '../../../core/services/experience.service';
import { SkillCategoryDto, UserSkillFullDto } from '../../../shared/models/skill-dtos';
import { SkillComponent } from '../../../shared/components/skill.component/skill.component';

interface SkillRow extends UserSkillFullDto {
  /** Short titles of timeline entries that list this skill, newest first. */
  usedInKeys: string[];
}

interface SkillArea {
  category: SkillCategoryDto;
  skills: SkillRow[];
}

@Component({
  selector: 'app-skills-matrix',
  standalone: true,
  imports: [AsyncPipe, TranslocoPipe, SkillComponent],
  templateUrl: './skills-matrix.component.html',
  styleUrl: './skills-matrix.component.scss',
})
export class SkillsMatrixComponent {
  /** Skills grouped by area, each with the timeline entries it was used in. */
  readonly areas$ = forkJoin({
    skills: inject(UserSkillsService).getUserSkills(),
    experience: inject(ExperienceService).getExperience(),
  }).pipe(
    map(({ skills, experience }) => {
      const areas = new Map<string, SkillArea>();

      for (const skill of skills) {
        const usedInKeys = experience
          .filter((e) => e.skills.some((s) => s.key === skill.skillKey))
          .map((e) => e.shortTitleKey);

        const area = areas.get(skill.category.key) ?? { category: skill.category, skills: [] };
        area.skills.push({ ...skill, usedInKeys });
        areas.set(skill.category.key, area);
      }

      // Skills arrive sorted by area, so insertion order is display order.
      return [...areas.values()];
    }),
  );
}
