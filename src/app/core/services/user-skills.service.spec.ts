import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserSkillsService } from './user-skills.service';
import { UserSkillDto, UserSkillFullDto } from '../../shared/models/skill-dtos';
import { flushSkillData } from '../../../testing/fixtures';

describe('UserSkillsService', () => {
  let service: UserSkillsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserSkillsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function load(userSkills: UserSkillDto[]): UserSkillFullDto[] {
    let result: UserSkillFullDto[] = [];
    service.getUserSkills().subscribe((v) => (result = v));
    http.expectOne('assets/data/user-skills.json').flush(userSkills);
    flushSkillData(http);
    return result;
  }

  it('sorts by area order, then tier, then name', () => {
    const result = load([
      { skillKey: 'angular', tier: 'core' },
      { skillKey: 'sql', tier: 'core' },
      { skillKey: 'csharp', tier: 'core' },
    ]);
    // backend (order 1) before frontend (order 2); csharp before sql by name.
    expect(result.map((s) => s.skillKey)).toEqual(['csharp', 'sql', 'angular']);
  });

  it('orders tiers core, proficient, familiar within an area', () => {
    const result = load([
      { skillKey: 'csharp', tier: 'familiar' },
      { skillKey: 'sql', tier: 'core' },
    ]);
    expect(result.map((s) => s.skillKey)).toEqual(['sql', 'csharp']);
  });

  it('attaches the skill and its category', () => {
    const [skill] = load([{ skillKey: 'csharp', tier: 'core' }]);
    expect(skill.skill.nameKey).toBe('skill.csharp');
    expect(skill.category.key).toBe('backend');
    expect(skill.tier).toBe('core');
  });

  it('drops skills that do not resolve', () => {
    expect(load([{ skillKey: 'cobol', tier: 'core' }])).toEqual([]);
  });
});
