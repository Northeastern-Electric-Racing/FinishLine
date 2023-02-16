/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ThemeOptions } from '@mui/material/styles';

export const themeChoices = ['light', 'dark'];

const headingCommonTheme = {
  fontFamily: ['Oswald', 'sans-serif'].join(','),
  fontWeight: 600 /* semi bold */
};

// cannot directly add typography: { fontFamily: ... } in nerThemeOptions
const defaultFontTheme = {
  fontFamily: ['Lato', 'sans-serif'].join(',')
};

/**
 * Common options that we'll want for pretty much every single theme
 */
export const nerThemeOptions: ThemeOptions = {
  palette: {
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
        disableRipple: true,
        color: 'primary'
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

export const lightThemeOptions: ThemeOptions = {
  palette: {
    background: {
      default: '#FFFFFF',
      paper: '#F7F7F7'
    }
  }
};

export const darkThemeOptions: ThemeOptions = {
  palette: {
    background: {
      default: '#121212',
      paper: '#242526'
    }
  }
};
