import {Component, DestroyRef, inject} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {CookiesBannerComponent} from './shared/components/cookies-banner.component/cookies-banner.component';
import {Title} from '@angular/platform-browser';
import {filter, map, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookiesBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private destroyRef = inject(DestroyRef);
  private titleService = inject(Title);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private title = 'Hryhorii Kyrylchenko';

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.getChild(this.activatedRoute)),
        switchMap(route => route.data as import('rxjs').Observable<{ title?: string }>),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(data => {
        this.titleService.setTitle(data.title ? `${data.title} | ${this.title}` : this.title);
      });
  }

  private getChild(route: ActivatedRoute): ActivatedRoute {
    return route.firstChild ? this.getChild(route.firstChild) : route;
  }
}
