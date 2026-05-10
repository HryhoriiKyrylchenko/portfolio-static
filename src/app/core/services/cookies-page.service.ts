import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';

export interface PageSectionDto {
  title: string;
  paragraphs: string[];
}

@Injectable({ providedIn: 'root' })
export class CookiesPageService {
  private http = inject(HttpClient);

  getSections(): Observable<PageSectionDto[]> {
    return this.http.get<{ cookies: { sections: PageSectionDto[] } }>(
      'assets/data/pages/cookies.structure.json'
    ).pipe(
      map(data => data.cookies.sections)
    );
  }
}
