import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { HomeComponent } from './home.component';
import { ExperienceService } from '../../../core/services/experience.service';
import { ExperienceFullDto } from '../../../shared/models/experience-dtos';
import { CONTACT_EMAIL, RESUME } from '../../../config/contact.config';
import { experience, translocoTesting } from '../../../../testing/fixtures';

describe('HomeComponent', () => {
  function render(current: Observable<ExperienceFullDto | null>) {
    TestBed.configureTestingModule({
      imports: [HomeComponent, translocoTesting({ en: { experience: { present: 'Present' } } })],
      providers: [provideRouter([]), { provide: ExperienceService, useValue: { getCurrent: () => current } }],
    });
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the current role with organization and period', () => {
    const el = render(
      of({
        ...experience({ id: 'epam', organization: 'EPAM Systems', startDate: '2026-07', endDate: null }),
        skills: [],
      }),
    );
    const card = el.querySelector('.current')!;
    expect(card.querySelector('.card-title')?.textContent?.trim()).toBe('epam.title');
    expect(card.querySelector('.current-meta')?.textContent).toContain('EPAM Systems');
    expect(card.querySelector('time')?.textContent?.trim()).toBe('Jul 2026 – Present');
  });

  it('hides the current role section when there is none', () => {
    const el = render(of(null));
    expect(el.querySelector('.current')).toBeNull();
  });

  it('offers the CV download with its file name', () => {
    const el = render(of(null));
    const downloads = el.querySelectorAll<HTMLAnchorElement>('a[download]');
    expect(downloads.length).toBe(2);
    downloads.forEach((a) => {
      expect(a.getAttribute('href')).toBe(RESUME.url);
      expect(a.getAttribute('download')).toBe(RESUME.fileName);
    });
  });

  it('links to email and LinkedIn', () => {
    const el = render(of(null));
    expect(el.querySelector(`a[href="mailto:${CONTACT_EMAIL}"]`)).not.toBeNull();
    const linkedIn = [...el.querySelectorAll<HTMLAnchorElement>('a')].find((a) => a.textContent?.trim() === 'LinkedIn');
    expect(linkedIn?.href).toContain('linkedin.com');
    expect(linkedIn?.rel).toBe('noopener noreferrer');
  });

  it('shows the three focus areas', () => {
    const el = render(of(null));
    expect(el.querySelectorAll('.focus-grid .home-card').length).toBe(3);
  });
});
