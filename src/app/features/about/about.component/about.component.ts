import { Component, inject } from '@angular/core';
import { AsyncPipe, NgStyle } from '@angular/common';
import { map } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { SkillsMatrixComponent } from '../skills-matrix.component/skills-matrix.component';
import { CredentialsComponent } from '../credentials.component/credentials.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [AsyncPipe, NgStyle, TranslocoPipe, SkillsMatrixComponent, CredentialsComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private transloco = inject(TranslocoService);

  readonly aboutImageUrl = 'assets/images/about_image.jpg';

  readonly contentParagraphs$ = this.transloco.selectTranslate('about.content').pipe(
    map(
      (content) =>
        content
          ?.split(/\n+/)
          .map((p: string) => p.trim())
          .filter(Boolean) ?? [],
    ),
  );
}
