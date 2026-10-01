import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, Language } from '../i18n/translations';

type ThemeMode = 'light' | 'dark';

interface ThemeLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['bn']) => string;
  theme: ThemeMode;
  toggleTheme: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string | number) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('as_sair_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn'; // Default বাংলা
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('as_sair_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('as_sair_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('as_sair_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (key: keyof typeof translations['bn']): string => {
    return translations[language][key] || translations['bn'][key] || String(key);
  };

  // Convert numbers to Bengali digits if language is Bengali
  const toBengaliDigits = (numStr: string | number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(numStr).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount || 0));
    if (language === 'bn') {
      return `৳ ${toBengaliDigits(formatted)}`;
    }
    return `৳ ${formatted}`;
  };

  const formatDate = (dateInput: string | number): string => {
    if (!dateInput) return '';
    try {
      const d = typeof dateInput === 'number' ? new Date(dateInput) : new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);

      if (language === 'bn') {
        const day = toBengaliDigits(d.getDate());
        const monthNamesBn = [
          'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
          'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
        ];
        const month = monthNamesBn[d.getMonth()];
        const year = toBengaliDigits(d.getFullYear());
        return `${day} ${month}, ${year}`;
      } else {
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch {
      return String(dateInput);
    }
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        toggleTheme,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
