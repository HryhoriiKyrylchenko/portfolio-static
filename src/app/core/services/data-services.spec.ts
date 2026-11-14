// The thin JSON-loading services: they request the right file and unwrap it.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectsService } from './projects.service';
import { CredentialsService } from './credentials.service';
import { PrivacyPageService } from './privacy-page.service';
import { CookiesPageService } from './cookies-page.service';
import { TranslocoHttpLoader } from '../../transloco-loader';
import { flushSkillData } from '../../../testing/fixtures';

describe('data services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('ProjectsService hydrates project skills', () => {
    let result: unknown[] = [];
    TestBed.inject(ProjectsService).getProjects().subscribe((v) => (result = v));
    http.expectOne('assets/data/projects.json').flush([
      { id: 1, slug: 'forja', skills: [{ skillKey: 'csharp' }, { skillKey: 'gone' }] },
    ]);
    flushSkillData(http);
    expect(result).toEqual([
      expect.objectContaining({ slug: 'forja', skills: [expect.objectContaining({ key: 'csharp' })] }),
    ]);
  });

  it('CredentialsService loads credentials and spoken languages', () => {
    const service = TestBed.inject(CredentialsService);
    let credentials: unknown;
    let languages: unknown;
    service.getCredentials().subscribe((v) => (credentials = v));
    service.getSpokenLanguages().subscribe((v) => (languages = v));
    http.expectOne('assets/data/credentials.json').flush([{ id: 'c' }]);
    http.expectOne('assets/data/spoken-languages.json').flush([{ code: 'en', level: 'B2' }]);
    expect(credentials).toEqual([{ id: 'c' }]);
    expect(languages).toEqual([{ code: 'en', level: 'B2' }]);
  });

  it('PrivacyPageService returns the privacy sections', () => {
    let sections: unknown;
    TestBed.inject(PrivacyPageService).getSections().subscribe((v) => (sections = v));
    http
      .expectOne('assets/data/pages/privacy.structure.json')
      .flush({ privacy: { sections: [{ title: 't', paragraphs: ['p'] }] } });
    expect(sections).toEqual([{ title: 't', paragraphs: ['p'] }]);
  });

  it('CookiesPageService returns the cookie policy sections', () => {
    let sections: unknown;
    TestBed.inject(CookiesPageService).getSections().subscribe((v) => (sections = v));
    http
      .expectOne('assets/data/pages/cookies.structure.json')
      .flush({ cookies: { sections: [{ title: 't', paragraphs: [] }] } });
    expect(sections).toEqual([{ title: 't', paragraphs: [] }]);
  });

  it('TranslocoHttpLoader loads the language file', () => {
    let translation: unknown;
    TestBed.inject(TranslocoHttpLoader).getTranslation('pl').subscribe((v) => (translation = v));
    http.expectOne('assets/i18n/pl.json').flush({ hello: 'cześć' });
    expect(translation).toEqual({ hello: 'cześć' });
  });
});
