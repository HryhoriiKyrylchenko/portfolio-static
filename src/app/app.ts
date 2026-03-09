import {Component, inject} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {CookiesBannerComponent} from './shared/components/cookies-banner.component/cookies-banner.component';
import {Title} from '@angular/platform-browser';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookiesBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private titleService = inject(Title);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private title = 'Hryhorii Kyrylchenko';

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const route = this.getChild(this.activatedRoute);
        route.data.subscribe(data => {
          this.titleService.setTitle(data['title'] ? data['title'] + " | " + this.title : this.title);
        });
      });
  }

  private getChild(route: ActivatedRoute): ActivatedRoute {
    return route.firstChild ? this.getChild(route.firstChild) : route;
  }
}
