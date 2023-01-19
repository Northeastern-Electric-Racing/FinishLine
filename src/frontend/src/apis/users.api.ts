/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { User } from 'shared';
import { apiUrls } from '../utils/urls';
import { authUserTransformer, userTransformer } from './transformers/users.transformers';
import { AuthenticatedUser, UserSettings } from 'shared';

/**
 * Fetches all users.
 */
export const getAllUsers = () => {
  return axios.get<User[]>(apiUrls.users(), {
    transformResponse: (data) => JSON.parse(data).map(userTransformer)
  });
};

/**
 * Fetch a single user.
 *
 * @param id User ID of the requested user.
 */
export const getSingleUser = (id: number) => {
  return axios.get<User>(apiUrls.usersById(`${id}`), {
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
export const logUserInDev = (userId: number) => {
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
export const getSingleUserSettings = (id: number) => {
  return axios.get<UserSettings>(apiUrls.userSettingsByUserId(`${id}`));
};

/**
 * Update the given user's settings by UserId
 */
export const updateUserSettings = (id: number, settings: UserSettings) => {
  return axios.post<{ message: string }>(apiUrls.userSettingsByUserId(`${id}`), settings);
};

export const updateUserRole = (id: number, role: string) => {
  return axios.post<{ message: string }>(apiUrls.userRoleByUserId(`${id}`), { role });
};
