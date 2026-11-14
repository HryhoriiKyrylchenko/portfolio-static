import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { translocoTesting } from '../../../../testing/fixtures';

describe('LanguageSwitcherComponent', () => {
  let transloco: TranslocoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [LanguageSwitcherComponent, translocoTesting()] });
    transloco = TestBed.inject(TranslocoService);
  });

  function render() {
    const fixture = TestBed.createComponent(LanguageSwitcherComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector<HTMLButtonElement>('button.lang-switcher')!;
    const items = () => [...el.querySelectorAll<HTMLLIElement>('.lang-menu li')];
    return { fixture, el, button, items };
  }

  it('does not change the language detected at startup', () => {
    transloco.setActiveLang('pl');
    const { button } = render();
    expect(transloco.getActiveLang()).toBe('pl');
    expect(button.textContent).toContain('Polski');
  });

  it('opens a menu with every supported language and marks the active one', () => {
    const { fixture, button, items } = render();
    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(items().map((li) => li.textContent?.replace('✓', '').trim())).toEqual(['English', 'Polski']);
    expect(items().map((li) => li.classList.contains('active'))).toEqual([true, false]);
  });

  it('switches language and closes the menu', () => {
    const { fixture, button, items } = render();
    button.click();
    fixture.detectChanges();

    items()[1].click();
    fixture.detectChanges();

    expect(transloco.getActiveLang()).toBe('pl');
    expect(items()).toEqual([]);
    expect(button.textContent).toContain('Polski');
  });

  it('closes on Escape', () => {
    const { fixture, button, items } = render();
    button.click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(items()).toEqual([]);
  });

  it('closes on a click outside, but not on a click inside the menu', () => {
    const { fixture, button, el, items } = render();
    button.click();
    fixture.detectChanges();

    el.querySelector<HTMLElement>('.lang-menu')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(items().length).toBe(2);

    document.body.click();
    fixture.detectChanges();
    expect(items()).toEqual([]);
  });

  describe('legacy localStorage preference', () => {
    it('applies a saved supported language once and removes it', () => {
      localStorage.setItem('preferred-language', 'pl');
      render();
      expect(transloco.getActiveLang()).toBe('pl');
      expect(localStorage.getItem('preferred-language')).toBeNull();
    });

    it('ignores a saved language that is no longer supported', () => {
      localStorage.setItem('preferred-language', 'ru');
      render();
      expect(transloco.getActiveLang()).toBe('en');
      expect(localStorage.getItem('preferred-language')).toBeNull();
    });
  });
});
