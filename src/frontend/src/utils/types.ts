/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AuthenticatedUser, LinkCreateArgs } from 'shared';

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
  icon?: JSX.Element;
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
  links: LinkCreateArgs[];
  projectLeadId?: number;
  projectManagerId?: number;
}

export interface CreateSingleProjectPayload {
  crId: number;
  name: string;
  carNumber: number;
  summary: string;
  teamIds: string[];
  budget?: number;
  rules: string[];
  goals?: { id: number; detail: string }[];
  features?: { id: number; detail: string }[];
  otherConstraints?: { id: number; detail: string }[];
  links?: LinkCreateArgs[];
  projectLeadId?: number;
  projectManagerId?: number;
}
