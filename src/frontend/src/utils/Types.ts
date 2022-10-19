/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AuthenticatedUser, ThemeName } from 'shared';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface Auth {
  user: AuthenticatedUser | undefined;
  devSignin: (userId: number) => Promise<AuthenticatedUser>;
  signin: (token: string) => Promise<AuthenticatedUser>;
  signout: () => void;
  isLoading: boolean;
}

export interface Theme {
  name: ThemeName;
  className: string;
  bgColor: string;
  cardBg: string;
  cardBorder: string;
  toggleTheme?: (name: ThemeName) => void;
}

export interface LinkItem {
  name: string;
  icon?: IconProp;
  route: string;
}
