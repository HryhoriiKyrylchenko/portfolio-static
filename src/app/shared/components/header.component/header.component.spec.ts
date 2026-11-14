import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { HeaderComponent } from './header.component';
import { HeaderMobileComponent } from './header-mobile.component';
import { CustomBreakpoints } from '../../utils/custom-breakpoints';
import { RESUME } from '../../../config/contact.config';
import { translocoTesting } from '../../../../testing/fixtures';

const NAV_LINKS = [
  { textKey: 'nav.about', path: '/about' },
  { textKey: 'nav.experience', path: '/experience' },
];

function state(match: keyof typeof CustomBreakpoints | null): BreakpointState {
  const breakpoints = Object.fromEntries(
    Object.entries(CustomBreakpoints).map(([name, query]) => [query, name === match]),
  );
  return { matches: match !== null, breakpoints };
}

describe('HeaderComponent', () => {
  let screen: BehaviorSubject<BreakpointState>;

  beforeEach(() => {
    screen = new BehaviorSubject(state('Desktop'));
    TestBed.configureTestingModule({
      imports: [HeaderComponent, translocoTesting()],
      providers: [provideRouter([]), { provide: BreakpointObserver, useValue: { observe: () => screen } }],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('navLinks', NAV_LINKS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const variant = () =>
      ['app-header-mobile', 'app-header-tablet', 'app-header-desktop'].filter((s) => el.querySelector(s));
    return { fixture, el, variant };
  }

  it('renders the variant for the current screen size', () => {
    const { fixture, variant } = render();
    expect(variant()).toEqual(['app-header-desktop']);

    screen.next(state('Tablet'));
    fixture.detectChanges();
    expect(variant()).toEqual(['app-header-tablet']);

    screen.next(state('Mobile'));
    fixture.detectChanges();
    expect(variant()).toEqual(['app-header-mobile']);
  });

  it('falls back to desktop when no breakpoint matches', () => {
    screen.next(state(null));
    expect(render().variant()).toEqual(['app-header-desktop']);
  });

  it('passes the nav links and a CV download to the desktop header', () => {
    const { el } = render();
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/about', '/experience', RESUME.url]));
    expect(el.querySelector(`a[download="${RESUME.fileName}"]`)).not.toBeNull();
  });
});

describe('HeaderMobileComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderMobileComponent, translocoTesting()],
      // Clicking a nav link navigates; any path is fine here.
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
  });

  it('opens the nav menu, lists the links and the CV, and closes after a link is chosen', () => {
    const fixture = TestBed.createComponent(HeaderMobileComponent);
    fixture.componentRef.setInput('navLinks', NAV_LINKS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const menu = () => el.querySelector('.mobile-nav-modal');

    expect(menu()).toBeNull();
    el.querySelector<HTMLButtonElement>('.mobile-nav-btn')!.click();
    fixture.detectChanges();

    const links = [...menu()!.querySelectorAll<HTMLAnchorElement>('a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/about', '/experience', RESUME.url]);

    links[0].click();
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });

  it('closes the menu with the close button', () => {
    const fixture = TestBed.createComponent(HeaderMobileComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector<HTMLButtonElement>('.mobile-nav-btn')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.close-btn')!.click();
    fixture.detectChanges();

    expect(el.querySelector('.mobile-nav-modal')).toBeNull();
  });
});
