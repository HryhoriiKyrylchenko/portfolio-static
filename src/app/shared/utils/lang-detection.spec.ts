import { mapBrowserLang, resolveStartLang } from './lang-detection';

describe('mapBrowserLang', () => {
  it('maps supported locales to their language', () => {
    expect(mapBrowserLang('pl')).toBe('pl');
    expect(mapBrowserLang('pl-PL')).toBe('pl');
    expect(mapBrowserLang('en-GB')).toBe('en');
    expect(mapBrowserLang('EN_us')).toBe('en');
  });

  it('falls back to English for unsupported locales', () => {
    expect(mapBrowserLang('de-DE')).toBe('en');
    expect(mapBrowserLang('uk')).toBe('en');
  });

  it('returns undefined when there is no locale', () => {
    expect(mapBrowserLang(undefined)).toBeUndefined();
    expect(mapBrowserLang('')).toBeUndefined();
  });
});

describe('resolveStartLang', () => {
  const defaultLang = 'en';

  it('prefers a supported language saved in the cookie', () => {
    expect(resolveStartLang({ cachedLang: 'pl', cultureLang: 'en-US', defaultLang })).toBe('pl');
  });

  it('ignores a saved language that is no longer supported', () => {
    expect(resolveStartLang({ cachedLang: 'uk', cultureLang: 'pl-PL', defaultLang })).toBe('pl');
  });

  it('uses the browser culture when nothing is saved', () => {
    expect(resolveStartLang({ cachedLang: null, cultureLang: 'pl-PL', defaultLang })).toBe('pl');
  });

  it('uses the browser language when there is no culture', () => {
    expect(resolveStartLang({ browserLang: 'pl', defaultLang })).toBe('pl');
  });

  it('falls back to the default language when nothing is known', () => {
    expect(resolveStartLang({ defaultLang })).toBe('en');
  });
});
