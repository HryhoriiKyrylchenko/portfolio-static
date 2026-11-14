import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('LoadingInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let states: boolean[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    states = [];
    TestBed.inject(LoadingService).loading$.subscribe((v) => states.push(v));
  });

  afterEach(() => backend.verify());

  it('shows the spinner during a request and hides it after success', () => {
    http.get('/data').subscribe();
    expect(states).toEqual([false, true]);
    backend.expectOne('/data').flush({});
    expect(states).toEqual([false, true, false]);
  });

  it('hides the spinner after an error', () => {
    http.get('/data').subscribe({ error: () => undefined });
    backend.expectOne('/data').flush('nope', { status: 500, statusText: 'Server Error' });
    expect(states.at(-1)).toBe(false);
  });
});
