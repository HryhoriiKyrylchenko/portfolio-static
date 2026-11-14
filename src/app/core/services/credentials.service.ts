import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CredentialDto, SpokenLanguageDto } from '../../shared/models/credential-dtos';

@Injectable({ providedIn: 'root' })
export class CredentialsService {
  private http = inject(HttpClient);

  getCredentials(): Observable<CredentialDto[]> {
    return this.http.get<CredentialDto[]>('assets/data/credentials.json');
  }

  getSpokenLanguages(): Observable<SpokenLanguageDto[]> {
    return this.http.get<SpokenLanguageDto[]>('assets/data/spoken-languages.json');
  }
}
