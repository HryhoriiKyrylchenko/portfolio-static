import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CredentialsComponent } from './credentials.component';
import { CredentialsService } from '../../../core/services/credentials.service';
import { translocoTesting } from '../../../../testing/fixtures';

describe('CredentialsComponent', () => {
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CredentialsComponent, translocoTesting({ en: { spoken: { native: 'Native', en: 'English' } } })],
      providers: [
        {
          provide: CredentialsService,
          useValue: {
            getCredentials: () =>
              of([
                { id: 'school', type: 'education', titleKey: 'c.school', issuer: 'IT STEP', period: '2021 – 2025', url: null },
                { id: 'cert', type: 'certification', titleKey: 'c.cert', issuer: 'freeCodeCamp', period: '2025', url: 'https://example.com/cert' },
              ]),
            getSpokenLanguages: () =>
              of([
                { code: 'uk', level: 'native' },
                { code: 'en', level: 'B2' },
              ]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(CredentialsComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('lists credentials with issuer and period', () => {
    const meta = [...el.querySelectorAll('.card-meta')].map((m) => m.textContent?.trim());
    expect(meta).toEqual(['IT STEP · 2021 – 2025', 'freeCodeCamp · 2025']);
  });

  it('shows a verification link only when there is a URL', () => {
    const links = el.querySelectorAll<HTMLAnchorElement>('.card-link');
    expect(links.length).toBe(1);
    expect(links[0].href).toBe('https://example.com/cert');
    expect(links[0].rel).toBe('noopener noreferrer');
  });

  it('translates "native" and shows CEFR levels as-is', () => {
    const levels = [...el.querySelectorAll('.language-row dd')].map((d) => d.textContent?.trim());
    expect(levels).toEqual(['Native', 'B2']);
  });
});
