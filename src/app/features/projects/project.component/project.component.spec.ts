import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProjectComponent } from './project.component';
import { ProjectsService } from '../../../core/services/projects.service';
import { SeoService } from '../../../core/services/seo.service';
import { ProjectFullDto } from '../../../shared/models/project-dtos';
import { SkillFullDto } from '../../../shared/models/skill-dtos';
import { CATEGORIES, SKILLS, translocoTesting } from '../../../../testing/fixtures';

const full = (key: string): SkillFullDto => {
  const skill = SKILLS.find((s) => s.key === key)!;
  return { ...skill, category: CATEGORIES.find((c) => c.key === skill.categoryKey)! };
};

const forja: ProjectFullDto = {
  id: 1,
  slug: 'forja',
  coverImage: 'cover.jpg',
  demoUrl: '',
  repoUrl: 'https://github.com/example/forja',
  titleKey: 'forja.title',
  shortDescriptionKey: 'forja.short',
  descriptionSectionsKeys: { results: 'forja.results', overview: 'forja.overview' },
  skills: [full('angular'), full('sql'), full('csharp')],
};

describe('ProjectComponent', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let setPage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ slug: 'forja' }));
    setPage = vi.fn();
    TestBed.configureTestingModule({
      imports: [ProjectComponent, translocoTesting()],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: ProjectsService, useValue: { getProjects: () => of([forja]) } },
        { provide: SeoService, useValue: { setPage } },
      ],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(ProjectComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('shows the project for the slug and sets its page title', () => {
    const { el } = render();
    expect(el.querySelector('.project-title')?.textContent?.trim()).toBe('forja.title');
    expect(setPage).toHaveBeenCalledWith('forja.title', 'forja.short');
  });

  it('shows case-study sections in reading order and skips missing ones', () => {
    const { el } = render();
    const subtitles = [...el.querySelectorAll('.project-subtitle')].map((h) => h.textContent?.trim());
    expect(subtitles).toEqual(['project.overview', 'project.results']);
  });

  it('groups skills by area in display order, sorted by name', () => {
    const { el } = render();
    const groups = [...el.querySelectorAll('.skills-category-section')].map((g) => ({
      area: g.querySelector('.skill-category')?.textContent?.trim(),
      skills: g.querySelectorAll('app-skill').length,
    }));
    expect(groups).toEqual([
      { area: 'cat.backend', skills: 2 },
      { area: 'cat.frontend', skills: 1 },
    ]);
  });

  it('links to the repository and hides an empty demo link', () => {
    const { el } = render();
    const links = [...el.querySelectorAll<HTMLAnchorElement>('.project-links a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['https://github.com/example/forja']);
    expect(links[0].rel).toBe('noopener noreferrer');
  });

  it('renders nothing for an unknown slug', () => {
    params.next(convertToParamMap({ slug: 'missing' }));
    const { el } = render();
    expect(el.querySelector('.project-dialog')).toBeNull();
    expect(setPage).not.toHaveBeenCalled();
  });

  it('goes back to the experience timeline', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { el } = render();
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(navigate).toHaveBeenCalledWith(['/experience']);
  });
});
