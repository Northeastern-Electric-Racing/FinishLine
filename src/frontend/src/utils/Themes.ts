/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Theme } from './Types';

const themes: Theme[] = [
  {
    name: 'DARK',
    className: 'dark',
    bgColor: '#353434',
    cardBg: 'dark',
    cardBorder: 'light'
  },
  {
    name: 'LIGHT',
    className: 'light',
    bgColor: '#ffffff',
    cardBg: 'light',
    cardBorder: 'dark'
  }
];

export default themes;
