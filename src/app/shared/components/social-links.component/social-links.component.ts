import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import {SOCIAL_LINKS, SocialLink} from '../../../config/social-links.config';

@Component({
  selector: 'app-social-links',
  imports: [],
  templateUrl: './social-links.component.html',
  styleUrl: './social-links.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class SocialLinksComponent {
  private _iconSize = '3rem';

  @Input()
  set iconSize(size: string) {
    this._iconSize = size;
  }
  get iconSize() {
    return this._iconSize;
  }

  socialLinks = signal<SocialLink[]>(SOCIAL_LINKS);
}
