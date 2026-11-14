import {Component, HostListener} from '@angular/core';
import {SocialLinksComponent} from '../../../shared/components/social-links.component/social-links.component';
import {TranslocoPipe} from '@jsverse/transloco';
import {CONTACT_EMAIL} from '../../../config/contact.config';

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
  readonly email = CONTACT_EMAIL;
  iconSize = ContactsComponent.iconSizeFor(window.innerWidth);

  /** Larger social icons on desktop (the same 1400px breakpoint as the header). */
  static iconSizeFor(width: number): string {
    return width >= 1400 ? '7.8125rem' : '5.875rem';
  }

  @HostListener('window:resize')
  onResize(): void {
    this.iconSize = ContactsComponent.iconSizeFor(window.innerWidth);
  }
}
