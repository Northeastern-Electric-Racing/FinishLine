/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailId: string | null;
  role: Role;
}

export type UserPreview = Pick<User, 'userId' | 'firstName' | 'lastName' | 'email' | 'emailId' | 'role'>;

export type Role = 'APP_ADMIN' | 'ADMIN' | 'HEAD' | 'LEADERSHIP' | 'MEMBER' | 'GUEST';
export enum RoleEnum {
  APP_ADMIN = 'APP_ADMIN',
  ADMIN = 'ADMIN',
  HEAD = 'HEAD',
  LEADERSHIP = 'LEADERSHIP',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}

export type ThemeName = 'DARK' | 'LIGHT';

/**
 * User object used purely for authentication purposes.
 */
export interface AuthenticatedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailId: string | null;
  role: Role;
  defaultTheme?: ThemeName;
  isFinance?: boolean;
  teamAsHeadId?: string;
  favoritedProjectsId: string[];
  changeRequestsToReviewId: string[];
  isHeadOfFinance?: boolean;
  isAtLeastFinanceLead?: boolean;
  organizations: string[];
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
}

export interface Availability {
  dateSet: Date;
  availability: number[];
}

export interface UserWithScheduleSettings {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailId: string | null;
  role: Role;
  scheduleSettings?: UserScheduleSettings;
}

export interface SetUserScheduleSettingsArgs {
  personalGmail: string;
  personalZoomLink: string;
  availability: number[];
}

export interface SetUserScheduleSettingsPayload extends SetUserScheduleSettingsArgs {
  drScheduleSettingsId: string;
}
