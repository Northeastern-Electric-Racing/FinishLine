/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import type { AvailabilityCreateArgs } from './calendar-types.js';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: Role;
}

export type UserPreview = Pick<User, 'userId' | 'firstName' | 'lastName'>;

export type UserWithRole = User & { role: Role };

export type Role = 'APP_ADMIN' | 'ADMIN' | 'HEAD' | 'LEADERSHIP' | 'MEMBER' | 'GUEST';
export enum RoleEnum {
  APP_ADMIN = 'APP_ADMIN',
  ADMIN = 'ADMIN',
  HEAD = 'HEAD',
  LEADERSHIP = 'LEADERSHIP',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}

export enum Permission {
  EDIT_GRAPH = 'EDIT_GRAPH',
  CREATE_GRAPH = 'CREATE_GRAPH',
  VIEW_GRAPH = 'VIEW_GRAPH',
  DELETE_GRAPH = 'DELETE_GRAPH',
  EDIT_GRAPH_COLLECTION = 'EDIT_GRAPH_COLLECTION',
  CREATE_GRAPH_COLLECTION = 'CREATE_GRAPH_COLLECTION',
  VIEW_GRAPH_COLLECTION = 'VIEW_GRAPH_COLLECTION',
  DELETE_GRAPH_COLLECTION = 'DELETE_GRAPH_COLLECTION'
}

export type ThemeName = 'DARK' | 'LIGHT';

export type OrganizationPreview = Pick<
  Organization,
  | 'organizationId'
  | 'name'
  | 'dateCreated'
  | 'dateDeleted'
  | 'description'
  | 'applicationLink'
  | 'newMemberImageId'
  | 'platformDescription'
  | 'platformLogoImageId'
>;

export interface Organization {
  organizationId: string;
  name: string;
  dateCreated: Date | null;
  userCreated: User;
  dateDeleted?: Date | null;
  userDeleted?: User;
  treasurer?: User;
  advisor?: User;
  description: string;
  newMemberImageId?: string;
  applicationLink?: string;
  onboardingText?: string;
  contacts: Contact[];
  slackWorkspaceId?: string;
  partReviewGuideLink?: string;
  sponsorshipNotificationsSlackChannelId?: string;
  platformDescription: string;
  platformLogoImageId?: string;
}

/**
 * Type for the current user
 */
export interface AuthenticatedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  defaultTheme?: ThemeName;
  isFinance?: boolean;
  isAtLeastFinanceLead?: boolean;
  organizations: string[];
  onboardingTeamTypeIds: string[];
  onboardedTeamTypeIds: string[];
}

export interface UserSettings {
  id: string;
  defaultTheme: ThemeName;
  slackId: string;
}

export interface UserSecureSettings {
  userSecureSettingsId: string;
  nuid: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  phoneNumber: string;
}

export interface UpdateUserRolePayload {
  userId: string;
  role: string;
}

export interface UserScheduleSettings {
  drScheduleSettingsId: string;
  personalGmail: string;
  personalZoomLink: string;
  availabilities: Availability[];
  importedIcsCalendarUrl: string;
}

export interface Availability {
  dateSet: Date;
  availability: number[];
}

export interface UserWithScheduleSettings extends User {
  scheduleSettings?: UserScheduleSettings;
}

export interface SetUserScheduleSettingsArgs {
  personalGmail?: string;
  personalZoomLink?: string;
  availability: AvailabilityCreateArgs[];
  importedIcsCalendarUrl?: string;
}

export interface SetUserScheduleSettingsPayload extends SetUserScheduleSettingsArgs {
  drScheduleSettingsId: string;
}

export interface Contact {
  user: User;
  title: string;
}
