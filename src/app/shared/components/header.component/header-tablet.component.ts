import {Component, Input, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';
import {LanguageSwitcherComponent} from '../language-switcher.component/language-switcher.component';
import {ThemeToggleComponent} from '../theme-toggle.component/theme-toggle.component';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-header-tablet',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslocoPipe,
    ThemeToggleComponent,
    LanguageSwitcherComponent,
    ThemeToggleComponent
  ],
  templateUrl: './header-tablet.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderTabletComponent {
  @Input() navLinks: { textKey: string; path: string }[] = [];

  mobileNavOpen = signal(false);

  toggleMenu() {
    this.mobileNavOpen.set(!this.mobileNavOpen());
  }
}
