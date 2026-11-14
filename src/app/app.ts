import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookiesBannerComponent } from './shared/components/cookies-banner.component/cookies-banner.component';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookiesBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    inject(SeoService).init();
  }
}
