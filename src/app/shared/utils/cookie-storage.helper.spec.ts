import { cookiesStorageRoot } from './cookie-storage.helper';

describe('cookiesStorageRoot', () => {
  const storage = cookiesStorageRoot();

  afterEach(() => {
    for (const name of ['translocoLang', 'other', 'xtranslocoLang']) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });

  it('returns null for a missing cookie', () => {
    expect(storage.getItem('translocoLang')).toBeNull();
  });

  it('writes and reads back a value', () => {
    storage.setItem('translocoLang', 'pl');
    expect(storage.getItem('translocoLang')).toBe('pl');
  });

  it('encodes and decodes special characters', () => {
    storage.setItem('translocoLang', 'a b;c');
    expect(storage.getItem('translocoLang')).toBe('a b;c');
  });

  it('writes a persistent cookie for the whole site', () => {
    const spy = vi.spyOn(document, 'cookie', 'set');
    storage.setItem('translocoLang', 'en');
    const written = spy.mock.calls[0][0];
    expect(written).toContain('translocoLang=en');
    expect(written).toContain('path=/');
    expect(written).toContain('max-age=31536000');
    expect(written).toContain('SameSite=Lax');
    spy.mockRestore();
  });

  it('matches the whole cookie name, not a suffix', () => {
    document.cookie = 'xtranslocoLang=pl; path=/';
    expect(storage.getItem('translocoLang')).toBeNull();
  });

  it('reads the right cookie among several', () => {
    document.cookie = 'other=1; path=/';
    storage.setItem('translocoLang', 'pl');
    expect(storage.getItem('translocoLang')).toBe('pl');
  });

  it('removes a value', () => {
    storage.setItem('translocoLang', 'pl');
    storage.removeItem('translocoLang');
    expect(storage.getItem('translocoLang')).toBeNull();
  });
});
