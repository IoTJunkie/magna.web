'use client';

import { generateCssVariables, ThemeTypes } from '@/app/utils/multipleThemes';
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = ThemeTypes.LIGHT | ThemeTypes.DARK;

interface ThemeContextType {
  theme: Theme;
  switchTheme: () => void;
  updateTheme: (newTheme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: ThemeTypes.LIGHT,
  switchTheme: () => {},
  updateTheme: () => {},
});

interface ThemeContextProps {
  children: React.ReactNode;
}

export const CustomThemeProvider = ({ children }: ThemeContextProps) => {
  const [theme, setTheme] = useState<Theme>(ThemeTypes.LIGHT);

  useEffect(() => {
    // const currentTheme =
    //   localStorage.getItem('THEME_MODE') && localStorage.getItem('THEME_MODE') !== 'undefined'
    //     ? localStorage.getItem('THEME_MODE')
    //     : ThemeTypes.LIGHT;
    const currentTheme = ThemeTypes.LIGHT;
    setTheme(currentTheme as Theme);
  }, []);

  useEffect(() => {
    generateCssVariables(theme);
  }, [theme]);

  const switchTheme = () => {
    const newTheme = theme === ThemeTypes.LIGHT ? ThemeTypes.DARK : ThemeTypes.LIGHT;
    setTheme(newTheme);
    localStorage.setItem('THEME_MODE', newTheme);
  };

  const updateTheme = (newTheme: ThemeTypes) => {
    const theme = !newTheme ? ThemeTypes.LIGHT : newTheme;
    setTheme(theme);
    localStorage.setItem('THEME_MODE', theme);
  };

  return (
    <ThemeContext.Provider value={{ switchTheme, theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext: () => ThemeContextType = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
};

ThemeContext.displayName = 'SpinnerContext';
