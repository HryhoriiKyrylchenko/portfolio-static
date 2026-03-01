import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-footer-links',
  imports: [
    TranslocoPipe,
    RouterLink
  ],
  templateUrl: './footer-links.component.html',
  styleUrl: './footer-links.component.scss'
})
export class FooterLinksComponent {

}
