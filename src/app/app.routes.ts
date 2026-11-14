import { Routes } from '@angular/router';
import {LayoutComponent} from './shared/components/layout.component/layout.component';
import {ErrorComponent} from './features/error/error.component/error.component';
import {CookiesComponent} from './features/cookies/cookies.component/cookies.component';
import {PrivacyComponent} from './features/privacy/privacy.component/privacy.component';
import {ContactsComponent} from './features/contacts/contacts.component/contacts.component';
import {ExperienceComponent} from './features/experience/experience.component/experience.component';
import {AboutComponent} from './features/about/about.component/about.component';
import {HomeComponent} from './features/home/home.component/home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full', data: { seo: 'home' } },
      { path: 'about', component: AboutComponent, data: { seo: 'about' } },
      { path: 'experience', component: ExperienceComponent, data: { seo: 'experience' } },
      {
        path: 'projects/:slug',
        loadComponent: () => import('./features/projects/project.component/project.component').then(m => m.ProjectComponent)
      },
      // Old URLs from before the Experience redesign; keep shared links working.
      { path: 'portfolio', redirectTo: 'experience', pathMatch: 'full' },
      { path: 'portfolio/:slug', redirectTo: 'projects/:slug' },
      { path: 'contacts', component: ContactsComponent, data: { seo: 'contacts' } },
      { path: 'privacy', component: PrivacyComponent, data: { seo: 'privacy' } },
      { path: 'cookies', component: CookiesComponent, data: { seo: 'cookies' } },
      { path: '**', component: ErrorComponent, data: { seo: 'error', noindex: true } }
    ]
  },
  { path: '**', redirectTo: '' }
];
