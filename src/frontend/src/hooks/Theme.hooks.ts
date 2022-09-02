/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useContext, useMemo } from 'react';
import { ThemeToggleContext } from '../app/AppContextTheme';

// Provider hook that creates theme object and handles state
export const useProvideThemeToggle = () => {
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useMemo(
    () => () => setActiveTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light')),
    []
  );

  return { activeTheme, toggleTheme };
};

// Hook for child components to get the theme object
export const useToggleTheme = () => {
  const context = useContext(ThemeToggleContext);
  if (context === undefined) throw Error('Theme must be used inside of context.');
  return context;
};
