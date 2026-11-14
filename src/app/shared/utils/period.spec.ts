import { formatMonth, formatPeriod } from './period';

describe('formatMonth', () => {
  it('formats YYYY-MM as a short month and year in English', () => {
    expect(formatMonth('2025-02', 'en')).toBe('Feb 2025');
    expect(formatMonth('2021-12', 'en')).toBe('Dec 2021');
  });

  it('formats in Polish', () => {
    const expected = new Intl.DateTimeFormat('pl', { month: 'short', year: 'numeric' }).format(
      new Date(2025, 1),
    );
    expect(formatMonth('2025-02', 'pl')).toBe(expected);
    expect(expected).not.toBe('Feb 2025');
  });
});

describe('formatPeriod', () => {
  it('joins start and end months', () => {
    expect(formatPeriod('2025-01', '2025-04', 'en', 'Present')).toBe('Jan 2025 – Apr 2025');
  });

  it('uses the present label for ongoing entries', () => {
    expect(formatPeriod('2026-07', null, 'en', 'Present')).toBe('Jul 2026 – Present');
  });
});
