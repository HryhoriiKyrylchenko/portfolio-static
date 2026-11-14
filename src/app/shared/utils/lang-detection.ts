import { DEFAULT_LANG, SUPPORTED_LANG_CODES } from '../../config/languages.config';

export interface LangSources {
  cachedLang?: string | null;
  browserLang?: string;
  cultureLang?: string;
  defaultLang: string;
}

/** Maps a browser locale such as "pl-PL" to a site language; anything unsupported becomes English. */
export function mapBrowserLang(lang?: string): string | undefined {
  if (!lang) return undefined;
  const code = lang.toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANG_CODES.includes(code) ? code : DEFAULT_LANG;
}

/**
 * The language to start with: a supported language saved in the cookie, then the browser's
 * culture/language, then the default. Used as persist-lang's `getLangFn` in app.config.ts.
 */
export function resolveStartLang({ cachedLang, browserLang, cultureLang, defaultLang }: LangSources): string {
  const cached = cachedLang && SUPPORTED_LANG_CODES.includes(cachedLang) ? cachedLang : undefined;
  return cached || mapBrowserLang(cultureLang) || mapBrowserLang(browserLang) || defaultLang;
}
