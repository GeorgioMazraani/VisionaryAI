import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'system' | 'dark' | 'light';
type FontSize = 'small' | 'medium' | 'large';
type MessageDensity = 'compact' | 'comfortable' | 'spacious';

interface AppearanceState {
  theme: Theme;
  fontSize: FontSize;
  messageDensity: MessageDensity;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setMessageDensity: (density: MessageDensity) => void;
}

// Apply theme to document
const applyTheme = (theme: Theme) => {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 'medium',
      messageDensity: 'comfortable',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      setFontSize: (fontSize) => set({ fontSize }),
      setMessageDensity: (messageDensity) => set({ messageDensity }),
    }),
    {
      name: 'appearance-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);