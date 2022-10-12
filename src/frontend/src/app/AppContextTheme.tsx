/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext, useMemo } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
      <ThemeProvider theme={fullTheme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>{props.children}</LocalizationProvider>
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
};

export default AppContextSettings;
