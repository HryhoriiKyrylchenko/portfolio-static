import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExperienceService } from './experience.service';
import { ExperienceDto, ExperienceFullDto } from '../../shared/models/experience-dtos';
import { experience, flushSkillData } from '../../../testing/fixtures';

describe('ExperienceService', () => {
  let service: ExperienceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExperienceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function load<T>(source: (s: ExperienceService) => { subscribe: (fn: (v: T) => void) => unknown }, entries: ExperienceDto[]): T {
    let result!: T;
    source(service).subscribe((v) => (result = v));
    http.expectOne('assets/data/experience.json').flush(entries);
    flushSkillData(http);
    return result;
  }

  describe('getExperience', () => {
    it('sorts entries newest first', () => {
      const result = load<ExperienceFullDto[]>((s) => s.getExperience(), [
        experience({ id: 'old', startDate: '2021-12' }),
        experience({ id: 'new', startDate: '2026-07' }),
        experience({ id: 'mid', startDate: '2025-06' }),
      ]);
      expect(result.map((e) => e.id)).toEqual(['new', 'mid', 'old']);
    });

    it('puts ongoing entries before finished ones with the same start', () => {
      const result = load<ExperienceFullDto[]>((s) => s.getExperience(), [
        experience({ id: 'finished', startDate: '2026-02', endDate: '2026-06' }),
        experience({ id: 'ongoing', startDate: '2026-02', endDate: null }),
      ]);
      expect(result.map((e) => e.id)).toEqual(['ongoing', 'finished']);
    });

    it('resolves skill references and drops unknown ones', () => {
      const [entry] = load<ExperienceFullDto[]>((s) => s.getExperience(), [
        experience({ id: 'e', skills: [{ skillKey: 'csharp' }, { skillKey: 'unknown' }] }),
      ]);
      expect(entry.skills.map((s) => s.key)).toEqual(['csharp']);
      expect(entry.skills[0].category.key).toBe('backend');
    });
  });

  describe('getCurrent', () => {
    it('prefers the newest ongoing job or internship', () => {
      const current = load<ExperienceFullDto | null>((s) => s.getCurrent(), [
        experience({ id: 'project', type: 'project', startDate: '2026-09', endDate: null }),
        experience({ id: 'internship', type: 'internship', startDate: '2026-07', endDate: null }),
        experience({ id: 'school', type: 'education', startDate: '2021-12', endDate: '2025-05' }),
      ]);
      expect(current?.id).toBe('internship');
    });

    it('ignores finished jobs', () => {
      const current = load<ExperienceFullDto | null>((s) => s.getCurrent(), [
        experience({ id: 'old-job', type: 'work', startDate: '2024-01', endDate: '2024-06' }),
        experience({ id: 'project', type: 'project', startDate: '2025-01', endDate: null }),
      ]);
      expect(current?.id).toBe('project');
    });

    it('falls back to the newest entry', () => {
      const current = load<ExperienceFullDto | null>((s) => s.getCurrent(), [
        experience({ id: 'a', startDate: '2024-01' }),
        experience({ id: 'b', startDate: '2025-01' }),
      ]);
      expect(current?.id).toBe('b');
    });

    it('returns null when there are no entries', () => {
      expect(load<ExperienceFullDto | null>((s) => s.getCurrent(), [])).toBeNull();
    });
  });
});
