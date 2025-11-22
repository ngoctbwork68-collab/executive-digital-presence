import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'vi';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'portfolio-language',
    }
  )
);

// Helper to get bilingual content
export const getBilingualContent = <T extends Record<string, any>>(
  data: T,
  language: Language,
  field: string
): string => {
  const key = `${field}_${language}`;
  return data[key] || data[`${field}_en`] || '';
};

// Helper to get bilingual array content
export const getBilingualArray = <T extends Record<string, any>>(
  data: T,
  language: Language,
  field: string
): string[] => {
  const key = `${field}_${language}`;
  return data[key] || data[`${field}_en`] || [];
};
