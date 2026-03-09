import {Component, HostListener} from '@angular/core';
import {SocialLinksComponent} from '../../../shared/components/social-links.component/social-links.component';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
  standalone: true,
  imports: [
    TranslocoPipe,
    SocialLinksComponent
  ]
})
export class ContactsComponent {
  iconSize = '5.875rem';
  readonly email = "contact@hryhoriikyrylchenko.dev"

  @HostListener('window:resize')
  onResize(): void {
    const width = window.innerWidth;
    this.iconSize = width >= 1400 ? '7.8125rem' : '5.875rem';
  }
}
