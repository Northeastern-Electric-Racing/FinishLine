/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import {
  Project,
  SetUserScheduleSettingsPayload,
  User,
  UserScheduleSettings,
  UserSecureSettings,
  UserWithScheduleSettings
} from 'shared';
import { apiUrls } from '../utils/urls';
import { authUserTransformer, userTransformer } from './transformers/users.transformers';
import { AuthenticatedUser, UserSettings } from 'shared';
import { projectTransformer } from './transformers/projects.transformers';

/**
 * Fetches all users.
 */
export const getAllUsers = () => {
  return axios.get<UserWithScheduleSettings[]>(apiUrls.users(), {
    transformResponse: (data) => JSON.parse(data).map(userTransformer)
  });
};

/**
 * Fetch a single user.
 *
 * @param id User ID of the requested user.
 */
export const getSingleUser = (id: string) => {
  return axios.get<User>(apiUrls.usersById(id), {
    transformResponse: (data) => userTransformer(JSON.parse(data))
  });
};

/**
 * Log in a user.
 *
 * @param id_token The login token for the user.
 */
export const logUserIn = (id_token: string) => {
  return axios.post<AuthenticatedUser>(
    apiUrls.usersLogin(),
    { id_token },
    { transformResponse: (data) => authUserTransformer(JSON.parse(data)) }
  );
};

/**
 * Log in a dev user.
 *
 * @param userId The userId to log in.
 */
export const logUserInDev = (userId: string) => {
  return axios.post<AuthenticatedUser>(
    apiUrls.usersLoginDev(),
    { userId },
    { transformResponse: (data) => authUserTransformer(JSON.parse(data)) }
  );
};

/**
 * Fetch the user settings for a single user.
 *
 * @param id User ID of the requested user's settings.
 */
export const getSingleUserSettings = (id: string) => {
  return axios.get<UserSettings>(apiUrls.userSettingsByUserId(id));
};

/**
 * Fetch the secure settings for the current user
 */
export const getCurrentUserSecureSettings = () => {
  return axios.get<UserSecureSettings>(apiUrls.currentUserSecureSettings());
};

/**
 * Fetch a user's favorite projects
 *
 * @param id User ID of the requested user's favorite projects.
 */
export const getUsersFavoriteProjects = (id: string) => {
  return axios.get<Project[]>(apiUrls.userFavoriteProjects(id), {
    transformResponse: (data) => JSON.parse(data).map(projectTransformer)
  });
};

/**
 * Fetch a user's secure settings
 *
 * @param id User ID of the requested user's secure settings
 * @returns the secure settings
 */
export const getUserSecureSettings = (id: string) => {
  return axios.get<UserSecureSettings>(apiUrls.userSecureSettings(id));
};

/**
 * Fetch a user's schedule settings
 *
 * @param userId User ID of the requested user's schedule settings
 * @returns the schedule settings
 */
export const getUserScheduleSettings = (userId: string) => {
  return axios.get<UserScheduleSettings>(apiUrls.userScheduleSettings(userId));
};

/**
 * Update the given user's settings by UserId
 */
export const updateUserSettings = (id: string, settings: UserSettings) => {
  return axios.post<{ message: string }>(apiUrls.userSettingsByUserId(id), settings);
};

/**
 * Update the given user's secure settings by UserId
 */
export const updateUserSecureSettings = (settings: UserSecureSettings) => {
  return axios.post<{ message: string }>(apiUrls.userSecureSettingsSet(), settings);
};

/**
 * Update the given user's schedule settings by UserId
 */
export const updateUserScheduleSettings = (settings: SetUserScheduleSettingsPayload) => {
  return axios.post<UserScheduleSettings>(apiUrls.userScheduleSettingsSet(), settings);
};

export const updateUserRole = (id: string, role: string) => {
  return axios.post<{ message: string }>(apiUrls.userRoleByUserId(id), { role });
};
