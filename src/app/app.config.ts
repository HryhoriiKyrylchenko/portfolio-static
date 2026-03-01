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

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslocoPersistLang({
      storage: { useValue: cookiesStorageRoot() },
      getLangFn: ({ cachedLang, browserLang, cultureLang, defaultLang }) => {
        console.log('Language detection:', { cachedLang, browserLang, cultureLang, defaultLang });

        const mapLang = (lang?: string): string | undefined => {
          if (!lang) return undefined;

          lang = lang.toLowerCase();

          if (lang.startsWith('en') || lang === 'en-us' || lang === 'en-gb') return 'en';
          if (lang.startsWith('pl') || lang === 'pl-pl') return 'pl';
          if (lang.startsWith('ru') || lang === 'ru-ru') return 'ru';
          if (lang.startsWith('uk') || lang === 'uk-ua') return 'uk';

          return 'en';
        };

        const result = cachedLang || mapLang(cultureLang) || mapLang(browserLang) || defaultLang;

        console.log('Selected language:', result);
        return result;
      }
    }),
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['en', 'pl', 'ru', 'uk'],
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

      console.log('Loading language:', activeLang);

      return firstValueFrom(
        transloco.load(activeLang).pipe(
          switchMap(() => transloco.selectTranslation(activeLang)),
          catchError((error) => {
            console.error('Error loading language:', error);
            return transloco.load('en');
          })
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
