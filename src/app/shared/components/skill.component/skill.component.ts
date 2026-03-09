import {Component, Input} from '@angular/core';
import {SkillDto} from '../../models/skill-dtos';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-skill',
  standalone: true,
  templateUrl: './skill.component.html',
  imports: [
    TranslocoPipe
  ],
  styleUrl: './skill.component.scss'
})
export class SkillComponent {
  @Input() skill?: SkillDto;
}
