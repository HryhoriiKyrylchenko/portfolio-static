/** Formats "YYYY-MM" as a short localized month, e.g. "Feb 2025" / "lut 2025". */
export function formatMonth(yearMonth: string, lang: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' }).format(
    new Date(year, month - 1),
  );
}

/** "Feb 2025 – May 2025", or "Feb 2025 – <presentLabel>" when there is no end date. */
export function formatPeriod(
  startDate: string,
  endDate: string | null,
  lang: string,
  presentLabel: string,
): string {
  const end = endDate ? formatMonth(endDate, lang) : presentLabel;
  return `${formatMonth(startDate, lang)} – ${end}`;
}
