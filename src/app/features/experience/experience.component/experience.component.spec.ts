import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { ExperienceComponent } from './experience.component';
import { ExperienceService } from '../../../core/services/experience.service';
import { ExperienceFullDto } from '../../../shared/models/experience-dtos';
import { experience, translocoTesting } from '../../../../testing/fixtures';

const entries: ExperienceFullDto[] = [
  {
    ...experience({ id: 'epam', type: 'internship', organization: 'EPAM Systems', startDate: '2026-07', endDate: null }),
    highlightKeys: ['epam.h1', 'epam.h2'],
    skills: [],
  },
  {
    ...experience({ id: 'forja', startDate: '2025-01', endDate: '2025-04', projectSlug: 'forja-platform' }),
    skills: [],
  },
];

describe('ExperienceComponent', () => {
  let el: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<ExperienceComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ExperienceComponent,
        translocoTesting({ en: { experience: { present: 'Present' } }, pl: { experience: { present: 'obecnie' } } }),
      ],
      providers: [provideRouter([]), { provide: ExperienceService, useValue: { getExperience: () => of(entries) } }],
    });
    fixture = TestBed.createComponent(ExperienceComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const items = () => [...el.querySelectorAll('.timeline-item')];

  it('renders one timeline item per entry and marks ongoing ones', () => {
    expect(items().length).toBe(2);
    expect(items().map((i) => i.classList.contains('ongoing'))).toEqual([true, false]);
  });

  it('formats periods with a present label for ongoing entries', () => {
    const periods = items().map((i) => i.querySelector('.timeline-period')?.textContent?.trim());
    expect(periods).toEqual(['Jul 2026 – Present', 'Jan 2025 – Apr 2025']);
  });

  it('re-formats periods when the language changes', () => {
    TestBed.inject(TranslocoService).setActiveLang('pl');
    fixture.detectChanges();
    expect(items()[0].querySelector('.timeline-period')?.textContent).toContain('obecnie');
  });

  it('shows the organization and highlights when present', () => {
    expect(items()[0].querySelector('.timeline-org')?.textContent?.trim()).toBe('EPAM Systems');
    expect(items()[0].querySelectorAll('.timeline-highlights li').length).toBe(2);
    expect(items()[1].querySelector('.timeline-org')).toBeNull();
    expect(items()[1].querySelector('.timeline-highlights')).toBeNull();
  });

  it('links entries with a project to their case study', () => {
    expect(items()[0].querySelector('.timeline-link')).toBeNull();
    expect(items()[1].querySelector('.timeline-link')?.getAttribute('href')).toBe('/projects/forja-platform');
  });
});
