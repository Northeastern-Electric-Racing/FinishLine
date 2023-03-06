/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AuthenticatedUser } from 'shared';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface Auth {
  user: AuthenticatedUser | undefined;
  devSignin: (userId: number) => Promise<AuthenticatedUser>;
  signin: (token: string) => Promise<AuthenticatedUser>;
  signout: () => void;
  isLoading: boolean;
}

export const themeChoices = ['DARK', 'LIGHT'];

export interface LinkItem {
  name: string;
  icon?: IconProp;
  route: string;
}

export interface VersionObject {
  tag_name: string;
}
