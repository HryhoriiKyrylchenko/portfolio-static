import {
  Component,
  inject,
} from '@angular/core';
import {AsyncPipe, NgStyle} from '@angular/common';
import {map} from 'rxjs';
import {SkillLevelComponent} from '../skill-level.component/skill-level.component';
import {LearningSkillComponent} from '../learning-skill.component/learning-skill.component';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {SkillComponent} from '../../../shared/components/skill.component/skill.component';
import {UserSkillFullDto} from '../../../shared/models/skill-dtos';
import {UserSkillsService} from '../../../core/services/user-skills.service';
import {LearningSkillsService} from '../../../core/services/learning-skills.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    AsyncPipe,
    NgStyle,
    TranslocoPipe,
    SkillComponent,
    SkillLevelComponent,
    LearningSkillComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private userSkillsService = inject(UserSkillsService);
  private learningSkillsService = inject(LearningSkillsService);
  private transloco = inject(TranslocoService);

  readonly aboutImageUrl = 'assets/images/about-image.jpg';

  readonly skills = this.userSkillsService.getUserSkills().pipe(
    map(skills => skills.sort((a, b) => {
      const orderDiff = a.category.displayOrder - b.category.displayOrder;
      return orderDiff !== 0
        ? orderDiff
        : a.skill.nameKey.localeCompare(b.skill.nameKey);
    }))
  );

  readonly skillsByCategory$ = this.skills.pipe(
    map(skills => {
      const grouped: Record<string, UserSkillFullDto[]> = {
        languages: [],
        tools: [],
        frameworks: []
      };

      for (const skill of skills) {
        const key = skill.skill.categoryKey;
        if (grouped[key]) {
          grouped[key].push(skill);
        }
      }

      return grouped;
    })
  );

  readonly learningSkills = this.learningSkillsService.getLearningSkills().pipe(
    map(skills => skills.sort((a, b) => {
      const orderDiff = a.displayOrder - b.displayOrder;
      return orderDiff !== 0
        ? orderDiff
        : a.skill.nameKey.localeCompare(b.skill.nameKey);
    }))
  );

  readonly contentParagraphs$ = this.transloco
    .selectTranslate('about.content')
    .pipe(
      map(content =>
        content
          ?.split(/\n+/)
          .map((p: string) => p.trim())
          .filter(Boolean) ?? []
      )
    );
}
