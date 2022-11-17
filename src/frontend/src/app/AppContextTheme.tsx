/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext, useMemo } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useProvideThemeToggle } from '../hooks/theme.hooks';
import { nerThemeOptions } from '../utils/Themes';
import { useAuth } from '../hooks/auth.hooks';

export const ThemeToggleContext = createContext({ activeTheme: 'light', toggleTheme: () => {} });

const AppContextSettings: React.FC = (props) => {
  const auth = useAuth();
  const theme = useProvideThemeToggle();

  const defaultTheme = auth.user?.defaultTheme;

  if (defaultTheme && defaultTheme.toLocaleLowerCase() !== theme.activeTheme) theme.toggleTheme();

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
      <ThemeProvider theme={fullTheme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>{props.children}</LocalizationProvider>
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
};

export default AppContextSettings;
