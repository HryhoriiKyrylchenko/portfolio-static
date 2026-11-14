import { TestBed } from '@angular/core/testing';
import { BackToTopComponent } from './back-to-top.component';
import { translocoTesting } from '../../../../testing/fixtures';

describe('BackToTopComponent', () => {
  const setPage = (docHeight: number, viewHeight: number, scrollTop: number) => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: docHeight });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: viewHeight });
    Object.defineProperty(window, 'pageYOffset', { configurable: true, value: scrollTop });
  };

  beforeEach(() => {
    setPage(3000, 800, 0);
    TestBed.configureTestingModule({ imports: [BackToTopComponent, translocoTesting()] });
  });

  function render() {
    const fixture = TestBed.createComponent(BackToTopComponent);
    fixture.detectChanges();
    const button = () => (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.to-top');
    const scroll = (top: number) => {
      setPage(3000, 800, top);
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
    };
    return { fixture, button, scroll };
  }

  it('is hidden at the top of the page', () => {
    expect(render().button()).toBeNull();
  });

  it('appears after scrolling down and hides again at the top', () => {
    const { button, scroll } = render();
    scroll(500);
    expect(button()).not.toBeNull();
    scroll(10);
    expect(button()).toBeNull();
  });

  it('stays hidden when the page fits in the window', () => {
    const { fixture, button } = render();
    setPage(600, 800, 100);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(button()).toBeNull();
  });

  it('scrolls smoothly to the top when clicked', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const { button, scroll } = render();
    scroll(500);
    button()!.click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollTo.mockRestore();
  });
});
