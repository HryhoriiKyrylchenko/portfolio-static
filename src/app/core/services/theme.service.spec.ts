import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-theme');
  });

  it('starts in light mode when nothing is saved', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.getTheme()).toBe('light');
    expect(document.body.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('restores a saved dark theme', () => {
    localStorage.setItem('theme', 'dark');
    expect(TestBed.inject(ThemeService).getTheme()).toBe('dark');
  });

  it('treats an unknown saved value as light', () => {
    localStorage.setItem('theme', 'purple');
    expect(TestBed.inject(ThemeService).getTheme()).toBe('light');
  });

  it('toggles between light and dark and saves the choice', () => {
    const service = TestBed.inject(ThemeService);
    service.toggleTheme();
    expect(service.getTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    service.toggleTheme();
    expect(service.getTheme()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
