import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  provideZoneChangeDetection, provideAppInitializer, inject
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient} from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import {provideTransloco, translocoConfig, TranslocoService} from '@jsverse/transloco';
import { provideTranslocoPersistLang } from '@jsverse/transloco-persist-lang';
import {cookiesStorageRoot} from './shared/utils/cookie-storage.helper';
import {catchError, firstValueFrom, switchMap} from 'rxjs';
import {LoadingInterceptor} from './core/interceptors/loading.interceptor';
import {SUPPORTED_LANG_CODES} from './config/languages.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslocoPersistLang({
      storage: { useValue: cookiesStorageRoot() },
      getLangFn: ({ cachedLang, browserLang, cultureLang, defaultLang }) => {
        const mapLang = (lang?: string): string | undefined => {
          if (!lang) return undefined;

          lang = lang.toLowerCase();

          if (lang.startsWith('en') || lang === 'en-us' || lang === 'en-gb') return 'en';
          if (lang.startsWith('pl') || lang === 'pl-pl') return 'pl';

          return 'en';
        };

        return (cachedLang && SUPPORTED_LANG_CODES.includes(cachedLang) ? cachedLang : undefined) || mapLang(cultureLang) || mapLang(browserLang) || defaultLang;
      }
    }),
    provideTransloco({
      config: translocoConfig({
        availableLangs: SUPPORTED_LANG_CODES,
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          useFallbackTranslation: true,
          allowEmpty: false,
          logMissingKey: isDevMode()
        }
      }),
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      const activeLang = transloco.getActiveLang() || 'en';

      return firstValueFrom(
        transloco.load(activeLang).pipe(
          switchMap(() => transloco.selectTranslation(activeLang)),
          catchError(() => transloco.load('en'))
        )
      );
    }),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
};
