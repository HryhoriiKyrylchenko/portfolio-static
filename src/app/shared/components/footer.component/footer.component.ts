import {Component} from '@angular/core';
import {BackToTopComponent} from '../back-to-top.component/back-to-top.component';
import {FooterLinksComponent} from '../footer-links.component/footer-links.component';
import {SocialLinksComponent} from '../social-links.component/social-links.component';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    TranslocoPipe,
    BackToTopComponent,
    FooterLinksComponent,
    SocialLinksComponent
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
