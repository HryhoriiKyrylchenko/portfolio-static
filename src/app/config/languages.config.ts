export interface Language {
  code: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polski' }
];

export const SUPPORTED_LANG_CODES = SUPPORTED_LANGUAGES.map(l => l.code);
export const DEFAULT_LANG = 'en';
