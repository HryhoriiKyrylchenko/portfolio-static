import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {PrivacyPageService} from '../../../core/services/privacy-page.service';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-privacy',
  standalone: true,
  templateUrl: './privacy.component.html',
  imports: [
    AsyncPipe,
    TranslocoPipe
  ],
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  private privacyPageService = inject(PrivacyPageService);

  readonly page$ = this.privacyPageService.getStructure();
}
