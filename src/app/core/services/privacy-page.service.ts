import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrivacyPageService {
  private http = inject(HttpClient);

  getSections(): Observable<any[]> {
    return this.http.get<{ privacy: { sections: any[] } }>(
      'assets/data/pages/privacy.structure.json'
    ).pipe(
      map(data => data.privacy.sections)
    );
  }
}
