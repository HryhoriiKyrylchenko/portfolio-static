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
import {DEFAULT_LANG, SUPPORTED_LANG_CODES, SUPPORTED_LANGUAGES} from '../../../config/languages.config';
import { CustomBreakpoints } from '../../utils/custom-breakpoints';
import {TranslocoService} from '@jsverse/transloco';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent implements AfterViewInit {
  private trans = inject(TranslocoService);
  private bp = inject(BreakpointObserver);

  languages = SUPPORTED_LANGUAGES;

  currentLang = signal<string>(this.getInitialLang());
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
    const savedLang = this.getInitialLang();
    this.trans.setActiveLang(savedLang);
  }

  ngAfterViewInit() {
    this.updateButtonWidth();
  }

  private getInitialLang(): string {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && SUPPORTED_LANG_CODES.includes(savedLang)) {
      return savedLang;
    }
    return DEFAULT_LANG;
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
    this.trans.setActiveLang(langCode);
    this.currentLang.set(langCode);
    localStorage.setItem('preferred-language', langCode);
    document.documentElement.lang = langCode;
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
