/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  emailId: string | null;
  role: Role;
}

export type UserPreview = Pick<User, 'userId' | 'firstName' | 'lastName' | 'email' | 'role'>;

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
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  emailId: string | null;
  role: Role;
  defaultTheme?: ThemeName;
  isFinance?: boolean;
  teamAsHeadId?: string;
  favoritedProjectsId: number[];
  changeRequestsToReviewId: number[];
  isHeadOfFinance?: boolean;
  isAtLeastFinanceLead?: boolean;
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
  userId: number;
  role: string;
}

export interface UserScheduleSettings {
  drScheduleSettingsId: string;
  personalGmail: string;
  personalZoomLink: string;
  availability: number[];
}

export interface UserWithScheduleSettings {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  emailId: string | null;
  role: Role;
  scheduleSettings?: UserScheduleSettings;
}
