import { useEffect, useState } from 'react';
import { DEFAULT_THEME_ID, THEME_DEFINITIONS } from '../assets/themes/themeDefinitions';
import { ThemeConfig, ThemeId } from '../types/theme';

const STORAGE_KEY = 'fisma_active_theme';

type ThemeChangeListener = (theme: ThemeConfig) => void;

class ThemeManager {
  private currentTheme: ThemeConfig;
  private listeners: Set<ThemeChangeListener> = new Set();

  constructor() {
    const savedThemeId = this.getSavedThemeId();
    this.currentTheme = THEME_DEFINITIONS[savedThemeId] || THEME_DEFINITIONS[DEFAULT_THEME_ID];
    this.applyTheme(this.currentTheme);
  }

  private getSavedThemeId(): ThemeId {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId;
      if (saved && THEME_DEFINITIONS[saved]) {
        return saved;
      }
    } catch {
      // Storage access blocked or unavailable
    }
    return DEFAULT_THEME_ID;
  }

  public getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  public getAllThemes(): ThemeConfig[] {
    return Object.values(THEME_DEFINITIONS);
  }

  public setTheme(themeId: ThemeId): void {
    const targetTheme = THEME_DEFINITIONS[themeId];
    if (!targetTheme) return;

    this.currentTheme = targetTheme;
    this.applyTheme(targetTheme);

    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      // Storage access error
    }

    this.notifyListeners();
  }

  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    Object.entries(theme.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Toggle dark/light class for Tailwind compatibility
    if (theme.category === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    root.setAttribute('data-theme', theme.id);
  }

  public subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentTheme));
  }
}

export const themeService = new ThemeManager();

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeConfig>(themeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = themeService.subscribe((newTheme) => {
      setThemeState(newTheme);
    });
    return unsubscribe;
  }, []);

  const changeTheme = (themeId: ThemeId) => {
    themeService.setTheme(themeId);
  };

  return {
    theme,
    allThemes: themeService.getAllThemes(),
    setTheme: changeTheme,
  };
}
