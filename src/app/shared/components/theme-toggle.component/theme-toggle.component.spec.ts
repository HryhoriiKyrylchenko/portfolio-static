import { TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { translocoTesting } from '../../../../testing/fixtures';

describe('ThemeToggleComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-theme');
    TestBed.configureTestingModule({ imports: [ThemeToggleComponent, translocoTesting()] });
  });

  function render() {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    return { fixture, button: (fixture.nativeElement as HTMLElement).querySelector('button')! };
  }

  it('offers dark mode while light is active', () => {
    const { button } = render();
    expect(button.textContent?.trim()).toBe('theme.dark');
  });

  it('starts from the saved theme', () => {
    localStorage.setItem('theme', 'dark');
    const { fixture } = render();
    expect(fixture.componentInstance.isDark()).toBe(true);
  });

  it('switches theme on click and updates its label', () => {
    const { fixture, button } = render();
    button.click();
    fixture.detectChanges();
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(button.textContent?.trim()).toBe('theme.light');
  });

  it('has an accessible name', () => {
    expect(render().button.getAttribute('aria-label')).toBe('a11y.theme');
  });
});
