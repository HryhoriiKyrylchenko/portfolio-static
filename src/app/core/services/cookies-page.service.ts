import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CookiesPageService {
  private http = inject(HttpClient);

  getStructure(): Observable<{ sections: any[] }> {
    return this.http.get<{ sections: any[] }>(
      'assets/data/pages/cookies.structure.json'
    );
  }
}
