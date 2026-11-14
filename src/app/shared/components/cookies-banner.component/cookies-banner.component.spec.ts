import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CookiesBannerComponent } from './cookies-banner.component';
import { translocoTesting } from '../../../../testing/fixtures';

describe('CookiesBannerComponent', () => {
  const clearConsent = () =>
    (document.cookie = 'cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/');

  beforeEach(() => {
    clearConsent();
    TestBed.configureTestingModule({
      imports: [CookiesBannerComponent, translocoTesting()],
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
  });

  afterEach(clearConsent);

  function render() {
    const fixture = TestBed.createComponent(CookiesBannerComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('shows the banner when consent has not been given', () => {
    const { el } = render();
    expect(el.querySelector('.cookie-banner')).not.toBeNull();
  });

  it('stays hidden once consent is stored', () => {
    document.cookie = 'cookie_consent=yes; path=/';
    const { el } = render();
    expect(el.querySelector('.cookie-banner')).toBeNull();
  });

  it('stores consent and hides on accept', () => {
    const { fixture, el } = render();
    el.querySelector<HTMLButtonElement>('.button_accept')!.click();
    fixture.detectChanges();
    expect(document.cookie).toContain('cookie_consent=yes');
    expect(el.querySelector('.cookie-banner')).toBeNull();
  });

  it('accepts when following the cookie policy link', () => {
    const { el } = render();
    const link = el.querySelector<HTMLAnchorElement>('.button_learn')!;
    expect(link.getAttribute('href')).toBe('/cookies');
    link.click();
    expect(document.cookie).toContain('cookie_consent=yes');
  });
});
