/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createContext, useMemo } from 'react';
import { useProvideThemeToggle } from '../hooks/Theme.hooks';
import { nerThemeOptions } from '../utils/Themes';

export const ThemeToggleContext = createContext({ activeTheme: 'dark', toggleTheme: () => {} });

const AppContextSettings: React.FC = (props) => {
  const theme = useProvideThemeToggle();
  const fullTheme = useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode: theme.activeTheme
          }
        },
        nerThemeOptions
      ),
    [theme]
  );

  return (
    <ThemeToggleContext.Provider value={theme}>
      <ThemeProvider theme={fullTheme}>{props.children}</ThemeProvider>
    </ThemeToggleContext.Provider>
  );
};

export default AppContextSettings;
