/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AuthenticatedUser, DescriptionBulletPreview, LinkCreateArgs } from 'shared';

export interface Auth {
  user: AuthenticatedUser | undefined;
  devSignin: (userId: string) => Promise<AuthenticatedUser>;
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
  projectId: string;
  crId: number;
  name: string;
  budget: number;
  summary: string;
  descriptionBullets: DescriptionBulletPreview[];
  links: LinkCreateArgs[];
  leadId?: number;
  managerId?: number;
}

export interface CreateSingleProjectPayload {
  crId: number;
  name: string;
  carNumber: number;
  summary: string;
  teamIds: string[];
  budget: number;
  descriptionBullets: DescriptionBulletPreview[];
  links?: LinkCreateArgs[];
  leadId?: number;
  managerId?: number;
}
