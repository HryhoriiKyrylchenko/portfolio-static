import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { AboutComponent } from './about.component';
import { SkillsMatrixComponent } from '../skills-matrix.component/skills-matrix.component';
import { CredentialsComponent } from '../credentials.component/credentials.component';
import { translocoTesting } from '../../../../testing/fixtures';

@Component({ selector: 'app-skills-matrix', template: '' })
class SkillsMatrixStub {}

@Component({ selector: 'app-credentials', template: '' })
class CredentialsStub {}

describe('AboutComponent', () => {
  function render(content: string) {
    TestBed.configureTestingModule({
      imports: [AboutComponent, translocoTesting({ en: { about: { title: 'About', content } } })],
    }).overrideComponent(AboutComponent, {
      remove: { imports: [SkillsMatrixComponent, CredentialsComponent] },
      add: { imports: [SkillsMatrixStub, CredentialsStub] },
    });
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    return [...(fixture.nativeElement as HTMLElement).querySelectorAll('.content-paragraph')].map((p) =>
      p.textContent?.trim(),
    );
  }

  it('splits the intro into paragraphs on line breaks', () => {
    expect(render('First.\n\nSecond.\nThird.')).toEqual(['First.', 'Second.', 'Third.']);
  });

  it('trims whitespace and skips empty lines', () => {
    expect(render('\n  First.  \n \n\nSecond.\n')).toEqual(['First.', 'Second.']);
  });
});
