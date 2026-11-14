import { TestBed } from '@angular/core/testing';
import { ContactsComponent } from './contacts.component';
import { CONTACT_EMAIL } from '../../../config/contact.config';
import { translocoTesting } from '../../../../testing/fixtures';

describe('ContactsComponent', () => {
  const setWidth = (width: number) =>
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });

  afterEach(() => setWidth(1024));

  function create() {
    TestBed.configureTestingModule({ imports: [ContactsComponent, translocoTesting()] });
    const fixture = TestBed.createComponent(ContactsComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the contact email as a mailto link', () => {
    const link = (create().nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
    expect(link?.getAttribute('href')).toBe(`mailto:${CONTACT_EMAIL}`);
    expect(link?.textContent?.trim()).toBe(CONTACT_EMAIL);
  });

  it('uses large icons when it first renders on a desktop-width window', () => {
    setWidth(1440);
    expect(create().componentInstance.iconSize).toBe('7.8125rem');
  });

  it('uses small icons below the desktop breakpoint', () => {
    setWidth(1399);
    expect(create().componentInstance.iconSize).toBe('5.875rem');
  });

  it('updates the icon size on resize', () => {
    setWidth(800);
    const fixture = create();
    setWidth(1400);
    window.dispatchEvent(new Event('resize'));
    expect(fixture.componentInstance.iconSize).toBe('7.8125rem');
  });
});
