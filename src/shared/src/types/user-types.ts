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
  teamAsLeadId?: string;
  favoritedProjectsId?: number[];
}

export interface UserSettings {
  id: string;
  defaultTheme: ThemeName;
  slackId: string;
  address: string;
  phone: string;
  nuid: string;
}

export interface UpdateUserRolePayload {
  userId: number;
  role: string;
}
