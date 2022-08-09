/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useMutation } from 'react-query';
import {
  getAllUsers,
  getSingleUser,
  getSingleUserSettings,
  logUserIn,
  updateUserSettings
} from './users.api';
import { User, AuthenticatedUser, UserSettings } from 'shared';
import { useAuth } from './auth.hooks';

/**
 * Custom React Hook to supply all users.
 */
export const useAllUsers = () => {
  return useQuery<User[], Error>(['users'], async () => {
    const { data } = await getAllUsers();
    return data;
  });
};

/**
 * Custom React Hook to supply a single user.
 *
 * @param id User ID of the requested user.
 */
export const useSingleUser = (id: number) => {
  return useQuery<User, Error>(['users', id], async () => {
    const { data } = await getSingleUser(id);
    return data;
  });
};

/**
 * Custom React Hook to log a user in.
 */
export const useLogUserIn = () => {
  return useMutation<AuthenticatedUser, Error, string>(
    ['users', 'login'],
    async (id_token: string) => {
      const { data } = await logUserIn(id_token);
      return data;
    }
  );
};

/**
 * Custom React Hook to supply a single user's settings.
 *
 * @param id User ID of the requested user's settings.
 */
export const useSingleUserSettings = (id: number) => {
  return useQuery<UserSettings, Error>(['users', id, 'settings'], async () => {
    const { data } = await getSingleUserSettings(id);
    return data;
  });
};

/**
 * Custom React Hook to update a user's settings.
 */
export const useUpdateUserSettings = () => {
  const auth = useAuth();
  return useMutation<{ message: string }, Error, UserSettings>(
    ['users', auth.user?.userId!, 'settings', 'update'],
    async (settings: UserSettings) => {
      if (!auth.user) throw new Error('Update settings not allowed when not logged in');
      const { data } = await updateUserSettings(auth.user.userId, settings);
      return data;
    }
  );
};
