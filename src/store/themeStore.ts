import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'custom';

export interface CustomTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardColor: string;
  accentColor: string;
}

interface ThemeState {
  theme: Theme;
  customTheme: CustomTheme;
  initTheme: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  updateCustomTheme: (theme: Partial<CustomTheme>) => void;
  applyThemeToCSS: () => void;
}

const DEFAULT_LIGHT_THEME: CustomTheme = {
  primaryColor: '#3B82F6',
  backgroundColor: '#f3f4f6',
  textColor: '#1f2937',
  cardColor: '#ffffff',
  accentColor: '#14B8A6',
};

const DEFAULT_DARK_THEME: CustomTheme = {
  primaryColor: '#14B8A6',
  backgroundColor: '#121212',
  textColor: '#e0e0e0',
  cardColor: '#1e1e1e',
  accentColor: '#3B82F6',
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  customTheme: DEFAULT_LIGHT_THEME,

  initTheme: () => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedCustomTheme = localStorage.getItem('customTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    const customTheme = savedCustomTheme 
      ? JSON.parse(savedCustomTheme) 
      : theme === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;

    set({ theme, customTheme });
    get().applyThemeToCSS();
  },

  toggleTheme: () => {
    set((state) => {
      // Cycle through themes: light -> dark -> custom -> light
      let newTheme: Theme;
      if (state.theme === 'light') newTheme = 'dark';
      else if (state.theme === 'dark') newTheme = 'custom';
      else newTheme = 'light';
      
      localStorage.setItem('theme', newTheme);
      
      return { theme: newTheme };
    });
    
    get().applyThemeToCSS();
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    
    // If switching to dark mode and customTheme hasn't been explicitly set,
    // use the default dark theme values
    if (theme === 'dark') {
      const savedCustomTheme = localStorage.getItem('customTheme');
      if (!savedCustomTheme) {
        set({ customTheme: DEFAULT_DARK_THEME });
      }
    } else if (theme === 'light') {
      // Same for light mode
      const savedCustomTheme = localStorage.getItem('customTheme');
      if (!savedCustomTheme) {
        set({ customTheme: DEFAULT_LIGHT_THEME });
      }
    }
    
    get().applyThemeToCSS();
  },

  updateCustomTheme: (theme) => {
    set((state) => ({ 
      customTheme: { ...state.customTheme, ...theme }
    }));
    
    localStorage.setItem('customTheme', JSON.stringify(get().customTheme));
    
    // If we're updating the custom theme, ensure we're using it
    if (get().theme !== 'custom') {
      set({ theme: 'custom' });
      localStorage.setItem('theme', 'custom');
    }
    
    get().applyThemeToCSS();
  },
  
  applyThemeToCSS: () => {
    const { theme, customTheme } = get();
    const root = document.documentElement;
    
    // First remove all theme classes
    root.classList.remove('dark');
    root.classList.remove('custom-theme');
    
    // Reset all custom CSS variables
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--background-color');
    root.style.removeProperty('--text-color');
    root.style.removeProperty('--card-color');
    root.style.removeProperty('--accent-color');
    
    // Then apply the selected theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'custom') {
      root.classList.add('custom-theme');
      
      // Apply custom theme colors directly to CSS variables
      root.style.setProperty('--primary-color', customTheme.primaryColor);
      root.style.setProperty('--background-color', customTheme.backgroundColor);
      root.style.setProperty('--text-color', customTheme.textColor);
      root.style.setProperty('--card-color', customTheme.cardColor);
      root.style.setProperty('--accent-color', customTheme.accentColor);
    }
  }
})); 