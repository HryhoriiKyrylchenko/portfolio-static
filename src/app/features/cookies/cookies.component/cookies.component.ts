import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {TranslocoPipe} from '@jsverse/transloco';
import {CookiesPageService} from '../../../core/services/cookies-page.service';

@Component({
  selector: 'app-cookies',
  standalone: true,
  templateUrl: './cookies.component.html',
  imports: [
    AsyncPipe,
    TranslocoPipe
  ],
  styleUrl: './cookies.component.scss'
})
export class CookiesComponent {
  private cookiesPageService = inject(CookiesPageService);

  readonly page$ = this.cookiesPageService.getSections();
}
