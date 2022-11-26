/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ThemeOptions } from '@mui/material/styles';

export const themeChoices = ['light', 'dark'];

const headingCommonTheme = {
  fontFamily: ['Barlow Semi Condensed', 'sans-serif'].join(','),
  fontWeight: 600 /* semi bold */
};

// cannot directly add typography: { fontFamily: ... } in nerThemeOptions
const defaultFontTheme = {
  fontFamily: ['Lato', 'sans-serif'].join(',')
};

export const nerThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#ef4345'
    },
    secondary: {
      main: '#a72a1e'
    }
  },
  typography: {
    h1: {
      ...headingCommonTheme
    },
    h2: {
      ...headingCommonTheme
    },
    h3: {
      ...headingCommonTheme
    },
    h4: {
      ...headingCommonTheme
    },
    h5: {
      ...headingCommonTheme
    },
    h6: {
      ...headingCommonTheme
    },
    subtitle1: {
      ...headingCommonTheme
    },
    subtitle2: {
      ...headingCommonTheme
    },
    body1: {
      ...defaultFontTheme
    },
    body2: {
      ...defaultFontTheme
    },
    button: {
      ...defaultFontTheme
    },
    caption: {
      ...defaultFontTheme
    },
    overline: {
      ...defaultFontTheme
    }
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true
      }
    },
    MuiChip: {
      styleOverrides: {
        colorSecondary: {
          backgroundColor: 'gray'
        }
      }
    },
    MuiList: {
      defaultProps: {
        dense: true
      }
    },
    MuiMenuItem: {
      defaultProps: {
        dense: true
      }
    },
    MuiTable: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          overflowWrap: 'anywhere'
        }
      }
    }
  }
};
