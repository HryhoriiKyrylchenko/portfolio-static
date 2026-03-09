import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CookiesPageService {
  private http = inject(HttpClient);

  getSections(): Observable<any[]> {
    return this.http.get<{ cookies: { sections: any[] } }>(
      'assets/data/pages/cookies.structure.json'
    ).pipe(
      map(data => data.cookies.sections)
    );
  }
}
