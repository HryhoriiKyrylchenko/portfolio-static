import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {CustomBreakpoints} from '../../utils/custom-breakpoints';
import {ThemeService} from '../../../core/services/theme.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  private bp = inject(BreakpointObserver);

  isDark = signal(false);

  isMobile = toSignal(
    this.bp.observe([CustomBreakpoints.Mobile])
      .pipe(map(res => res.matches)),
    { initialValue: false }
  );

  constructor() {
    this.isDark.set(this.themeService.getTheme() === 'dark');
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDark.set(this.themeService.getTheme() === 'dark');
  }

  get labelKey() {
    return this.isDark() ? 'theme.light' : 'theme.dark';
  }
}
