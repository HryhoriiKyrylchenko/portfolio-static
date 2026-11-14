import {
  Component,
  ElementRef,
  AfterViewInit,
  HostListener,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {SUPPORTED_LANG_CODES, SUPPORTED_LANGUAGES} from '../../../config/languages.config';
import { CustomBreakpoints } from '../../utils/custom-breakpoints';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';

const LEGACY_LANG_KEY = 'preferred-language';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent implements AfterViewInit {
  private trans = inject(TranslocoService);
  private bp = inject(BreakpointObserver);

  languages = SUPPORTED_LANGUAGES;

  /**
   * The active language. Transloco picks it at startup (cookie, then browser language, then
   * English; see app.config.ts) and persist-lang stores every change in the cookie, so this
   * component only reflects and changes it.
   */
  currentLang = toSignal(this.trans.langChanges$, { initialValue: this.trans.getActiveLang() });
  isOpen = signal<boolean>(false);
  buttonWidth = signal<number>(0);

  @ViewChild('langButton', { read: ElementRef }) langButton?: ElementRef<HTMLButtonElement>;

  isMobile = toSignal(
    this.bp.observe([CustomBreakpoints.Mobile])
      .pipe(map(res => res.matches)),
    { initialValue: false }
  );

  isMobileOrTablet = toSignal(
    this.bp.observe([CustomBreakpoints.Mobile, CustomBreakpoints.Tablet])
      .pipe(map(res => res.matches)),
  )

  constructor() {
    this.migrateLegacyPreference();
  }

  ngAfterViewInit() {
    this.updateButtonWidth();
  }

  /**
   * Older versions kept the chosen language in localStorage and forced English otherwise,
   * which overrode browser-language detection. Honor an explicit old choice once; from then
   * on the persist-lang cookie remembers it.
   */
  private migrateLegacyPreference(): void {
    try {
      const legacy = localStorage.getItem(LEGACY_LANG_KEY);
      localStorage.removeItem(LEGACY_LANG_KEY);
      if (legacy && SUPPORTED_LANG_CODES.includes(legacy) && legacy !== this.trans.getActiveLang()) {
        this.trans.setActiveLang(legacy);
      }
    } catch {
      // Storage unavailable (e.g. privacy mode): nothing to migrate.
    }
  }

  private updateButtonWidth(): void {
    if (this.langButton) {
      this.buttonWidth.set(this.langButton.nativeElement.offsetWidth);
    }
  }

  toggleMenu(): void {
    this.isOpen.update(value => !value);
    if (this.isOpen()) {
      this.updateButtonWidth();
    }
  }

  selectLanguage(langCode: string): void {
    // persist-lang saves it to the cookie; SeoService updates <html lang>.
    this.trans.setActiveLang(langCode);
    this.isOpen.set(false);
  }

  getCurrentLanguageName(): string {
    const lang = this.languages.find(l => l.code === this.currentLang());
    return lang ? lang.name : this.currentLang();
  }

  getLanguageName(code: string): string {
    const lang = this.languages.find(l => l.code === code);
    return lang ? lang.name : code;
  }

  isLanguageActive(code: string): boolean {
    return this.currentLang() === code;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isOpen() &&
      this.langButton &&
      !this.langButton?.nativeElement.contains(target) &&
    !target.closest('.lang-menu')) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}
