/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AuthenticatedUser, Link } from 'shared';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { SvgIcon } from '@mui/material';

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

export interface MUILinkItem {
  name: string;
  icon?: typeof SvgIcon;
  route: string;
}

export interface VersionObject {
  tag_name: string;
}

export interface EditSingleProjectPayload {
  projectId: number;
  crId: number;
  name: string;
  budget: number;
  summary: string;
  rules: string[];
  goals: { id: number; detail: string }[];
  features: { id: number; detail: string }[];
  otherConstraints: { id: number; detail: string }[];
  links: Link[];
  projectLeadId?: number;
  projectManagerId?: number;
}

export interface CreateSingleProjectPayload {
  crId: number;
  name: string;
  carNumber: number;
  summary: string;
}
