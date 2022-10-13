/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext } from 'react';
import { useProvideTheme } from '../hooks/theme.hooks';
import { Theme } from '../utils/Types';

export const ThemeContext = createContext<Theme | undefined>(undefined);

const AppContextSettings: React.FC = (props) => {
  const theme = useProvideTheme();
  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
};

export default AppContextSettings;
