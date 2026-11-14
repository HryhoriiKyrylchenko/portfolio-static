export interface CredentialDto {
  id: string;
  type: 'education' | 'certification';
  titleKey: string;
  /** Not translated. */
  issuer: string;
  /** Display text, e.g. "2021 – 2025". */
  period: string;
  /** Public verification link; null when there is none to share. */
  url: string | null;
}

export interface SpokenLanguageDto {
  /** Key under `spoken.` in the i18n files. */
  code: string;
  /** "native" (translated) or a CEFR level shown as-is. */
  level: string;
}
