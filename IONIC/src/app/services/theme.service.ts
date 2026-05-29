import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeSettings {
  mode: ThemeMode;
  useSystemPreference: boolean;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme_settings';
  private readonly DEFAULT_SETTINGS: ThemeSettings = {
    mode: 'light',
    useSystemPreference: true,
  };

  private themeSubject = new BehaviorSubject<ThemeMode>('light');
  theme$ = this.themeSubject.asObservable();

  private settingsSubject = new BehaviorSubject<ThemeSettings>(this.DEFAULT_SETTINGS);
  settings$ = this.settingsSubject.asObservable();

  private isDarkMode = false;

  constructor(private storage: Storage) {
    this.initializeTheme();
  }

  /**
   * Initialize theme on app startup
   */
  private async initializeTheme(): Promise<void> {
    // Load saved settings from storage
    const saved = await this.storage.get(this.STORAGE_KEY);
    const settings = saved || this.DEFAULT_SETTINGS;

    // Apply system preference if enabled
    if (settings.useSystemPreference) {
      this.checkSystemPreference();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        this.checkSystemPreference();
      });
    } else {
      this.setTheme(settings.mode);
    }

    this.settingsSubject.next(settings);
  }

  /**
   * Check system color scheme preference
   */
  private checkSystemPreference(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
  }

  /**
   * Set theme mode
   */
  setTheme(mode: ThemeMode): void {
    let actualMode: 'light' | 'dark' = 'light';

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualMode = prefersDark ? 'dark' : 'light';
    } else {
      actualMode = mode;
    }

    this.isDarkMode = actualMode === 'dark';
    this.applyTheme(actualMode);
    this.themeSubject.next(mode);

    // Update settings
    const currentSettings = this.settingsSubject.value;
    const updated = { ...currentSettings, mode };
    this.storage.set(this.STORAGE_KEY, updated);
    this.settingsSubject.next(updated);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(mode: 'light' | 'dark'): void {
    const html = document.documentElement;
    const body = document.body;

    if (mode === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
      body.classList.add('dark-theme');
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
      body.classList.remove('dark-theme');
    }

    // Set Ionic CSS variables
    this.setIonicVariables(mode);
  }

  /**
   * Set Ionic CSS variables for theme
   */
  private setIonicVariables(mode: 'light' | 'dark'): void {
    const root = document.documentElement;

    if (mode === 'dark') {
      // Dark theme colors - Serene Transit palette (Forest Green & Sage)
      root.style.setProperty('--ion-background-color', '#0f172a'); // Dark slate
      root.style.setProperty('--ion-background-color-rgb', '15, 23, 42');
      root.style.setProperty('--ion-text-color', '#e2e8f0'); // Light slate
      root.style.setProperty('--ion-text-color-rgb', '226, 232, 240');

      // Primary (Forest Green - dark variant)
      root.style.setProperty('--ion-color-primary', '#0d5f47');
      root.style.setProperty('--ion-color-primary-rgb', '13, 95, 71');
      root.style.setProperty('--ion-color-primary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-primary-contrast-rgb', '255, 255, 255');
      root.style.setProperty('--ion-color-primary-shade', '#0a4a38');
      root.style.setProperty('--ion-color-primary-tint', '#25805e');

      // Secondary (Sage - dark variant)
      root.style.setProperty('--ion-color-secondary', '#2a5948');
      root.style.setProperty('--ion-color-secondary-rgb', '42, 89, 72');
      root.style.setProperty('--ion-color-secondary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-secondary-contrast-rgb', '255, 255, 255');
      root.style.setProperty('--ion-color-secondary-shade', '#24493d');
      root.style.setProperty('--ion-color-secondary-tint', '#3f6b5a');

      // Tertiary/Accent
      root.style.setProperty('--ion-color-tertiary', '#1e40af'); // Blue
      root.style.setProperty('--ion-color-tertiary-rgb', '30, 64, 175');
      root.style.setProperty('--ion-color-tertiary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-tertiary-contrast-rgb', '255, 255, 255');

      // Cards & surfaces
      root.style.setProperty('--ion-color-step-50', '#1e293b');
      root.style.setProperty('--ion-color-step-100', '#334155');
      root.style.setProperty('--ion-color-step-150', '#475569');
      root.style.setProperty('--ion-color-step-200', '#64748b');
      root.style.setProperty('--ion-color-step-250', '#78909c');
      root.style.setProperty('--ion-color-step-300', '#90a4ae');
      root.style.setProperty('--ion-color-step-350', '#a8bcc4');
      root.style.setProperty('--ion-color-step-400', '#b0bec5');
      root.style.setProperty('--ion-color-step-450', '#cfd8dc');
      root.style.setProperty('--ion-color-step-500', '#eceff1');
      root.style.setProperty('--ion-color-step-550', '#f5f5f5');
      root.style.setProperty('--ion-color-step-600', '#f5f5f5');
      root.style.setProperty('--ion-color-step-650', '#f5f5f5');
      root.style.setProperty('--ion-color-step-700', '#fafafa');
      root.style.setProperty('--ion-color-step-750', '#fafafa');
      root.style.setProperty('--ion-color-step-800', '#fafafa');
      root.style.setProperty('--ion-color-step-850', '#ffffff');
      root.style.setProperty('--ion-color-step-900', '#ffffff');
      root.style.setProperty('--ion-color-step-950', '#ffffff');

      // Success
      root.style.setProperty('--ion-color-success', '#10b981');
      root.style.setProperty('--ion-color-success-rgb', '16, 185, 129');

      // Warning
      root.style.setProperty('--ion-color-warning', '#f59e0b');
      root.style.setProperty('--ion-color-warning-rgb', '245, 158, 11');

      // Danger
      root.style.setProperty('--ion-color-danger', '#ef4444');
      root.style.setProperty('--ion-color-danger-rgb', '239, 68, 68');
    } else {
      // Light theme colors - Serene Transit palette
      root.style.setProperty('--ion-background-color', '#fafafa');
      root.style.setProperty('--ion-background-color-rgb', '250, 250, 250');
      root.style.setProperty('--ion-text-color', '#1f2937');
      root.style.setProperty('--ion-text-color-rgb', '31, 41, 55');

      // Primary (Forest Green)
      root.style.setProperty('--ion-color-primary', '#10b981');
      root.style.setProperty('--ion-color-primary-rgb', '16, 185, 129');
      root.style.setProperty('--ion-color-primary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-primary-contrast-rgb', '255, 255, 255');
      root.style.setProperty('--ion-color-primary-shade', '#0d9e71');
      root.style.setProperty('--ion-color-primary-tint', '#2bc290');

      // Secondary (Sage)
      root.style.setProperty('--ion-color-secondary', '#6b7280');
      root.style.setProperty('--ion-color-secondary-rgb', '107, 114, 128');
      root.style.setProperty('--ion-color-secondary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-secondary-contrast-rgb', '255, 255, 255');
      root.style.setProperty('--ion-color-secondary-shade', '#5a6370');
      root.style.setProperty('--ion-color-secondary-tint', '#7a8290');

      // Tertiary/Accent
      root.style.setProperty('--ion-color-tertiary', '#3b82f6'); // Blue
      root.style.setProperty('--ion-color-tertiary-rgb', '59, 130, 246');
      root.style.setProperty('--ion-color-tertiary-contrast', '#ffffff');
      root.style.setProperty('--ion-color-tertiary-contrast-rgb', '255, 255, 255');

      // Success
      root.style.setProperty('--ion-color-success', '#10b981');
      root.style.setProperty('--ion-color-success-rgb', '16, 185, 129');

      // Warning
      root.style.setProperty('--ion-color-warning', '#f59e0b');
      root.style.setProperty('--ion-color-warning-rgb', '245, 158, 11');

      // Danger
      root.style.setProperty('--ion-color-danger', '#ef4444');
      root.style.setProperty('--ion-color-danger-rgb', '239, 68, 68');
    }
  }

  /**
   * Get current theme mode
   */
  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  /**
   * Check if dark mode is active
   */
  isDark(): boolean {
    return this.isDarkMode;
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    const current = this.themeSubject.value;
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  /**
   * Update system preference setting
   */
  setSystemPreference(useSystemPreference: boolean): void {
    const currentSettings = this.settingsSubject.value;
    const updated = { ...currentSettings, useSystemPreference };
    
    this.storage.set(this.STORAGE_KEY, updated);
    this.settingsSubject.next(updated);

    if (useSystemPreference) {
      this.checkSystemPreference();
    }
  }

  /**
   * Get theme settings
   */
  getSettings(): Observable<ThemeSettings> {
    return this.settings$;
  }
}
