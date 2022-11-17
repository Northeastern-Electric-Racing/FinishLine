/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ThemeOptions } from '@mui/material/styles';

export const themeChoices = ['light', 'dark'];

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
      fontFamily: 'Anton'
    },
    h2: {
      fontFamily: 'Anton'
    },
    h3: {
      fontFamily: 'Anton'
    },
    button: {
      fontFamily: 'Oswald'
    },
    caption: {
      fontFamily: 'Oswald'
    },
    overline: {
      fontFamily: 'Oswald'
    },
    body2: {
      fontFamily: 'Oswald'
    },
    body1: {
      fontFamily: 'Oswald'
    },
    subtitle2: {
      fontFamily: 'Anton'
    },
    subtitle1: {
      fontFamily: 'Anton'
    },
    h6: {
      fontFamily: 'Anton'
    },
    h5: {
      fontFamily: 'Anton'
    },
    h4: {
      fontFamily: 'Anton'
    },
    fontFamily: 'Oswald'
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true
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
    }
  }
};
