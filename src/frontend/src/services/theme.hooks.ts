/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useContext } from 'react';
import { ThemeContext } from '../app/app-context-theme/app-context-theme';
import themes from '../themes';

// Provider hook that creates theme object and handles state
export const useProvideTheme = () => {
  const [theme, setTheme] = useState(themes[0]);

  const toggleTheme = (name: string) => {
    const t = themes.find((element) => element.name === name);
    if (t) {
      setTheme(t);
    }
  };

  return { ...theme, toggleTheme };
};

// Hook for child components to get the theme object
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw Error('Theme must be used inside of context.');
  return context;
};
