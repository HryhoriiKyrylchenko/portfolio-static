import { Routes } from '@angular/router';
import {LayoutComponent} from './shared/components/layout.component/layout.component';
import {ErrorComponent} from './features/error/error.component/error.component';
import {CookiesComponent} from './features/cookies/cookies.component/cookies.component';
import {PrivacyComponent} from './features/privacy/privacy.component/privacy.component';
import {ContactsComponent} from './features/contacts/contacts.component/contacts.component';
import {PortfolioComponent} from './features/portfolio/portfolio.component/portfolio.component';
import {AboutComponent} from './features/about/about.component/about.component';
import {HomeComponent} from './features/home/home.component/home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'about', component: AboutComponent, data: { title: 'About'} },
      {
        path: 'portfolio',
        component: PortfolioComponent,
        data: { title: 'Portfolio'},
        children: [
          {
            path: ':slug',
            loadComponent: () => import('./features/portfolio/project.component/project.component').then(m => m.ProjectComponent)
          }
        ]
      },
      { path: 'contacts', component: ContactsComponent, data: { title: 'Contacts'} },
      { path: 'privacy', component: PrivacyComponent, data: { title: 'Privacy'} },
      { path: 'cookies', component: CookiesComponent, data: { title: 'Cookies'} },
      { path: '**', component: ErrorComponent, data: { title: 'Error'} }
    ]
  },
  { path: '**', redirectTo: '' }
];
