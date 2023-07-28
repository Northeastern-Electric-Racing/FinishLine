/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getAllUsers,
  getSingleUser,
  getSingleUserSettings,
  logUserIn,
  logUserInDev,
  updateUserSettings,
  updateUserRole,
  getUsersFavoriteProjects,
  updateUserSecureSettings
} from '../apis/users.api';
import { User, AuthenticatedUser, UserSettings, UpdateUserRolePayload, Project } from 'shared';
import { useAuth } from './auth.hooks';
import { useContext } from 'react';
import { UserContext } from '../app/AppContextUser';

/**
 * Custom React Hook to supply the current user
 */
export const useCurrentUser = (): AuthenticatedUser => {
  const user = useContext(UserContext);
  if (!user) throw Error('useCurrentUser must be used inside of context.');
  return user;
};

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
  return useMutation<AuthenticatedUser, Error, string>(['users', 'login'], async (id_token: string) => {
    const { data } = await logUserIn(id_token);
    return data;
  });
};

/**
 * Custom React Hook to log a dev user in.
 */
export const useLogUserInDev = () => {
  return useMutation<AuthenticatedUser, Error, number>(['users', 'login'], async (userId: number) => {
    const { data } = await logUserInDev(userId);
    return data;
  });
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
 * Custom React Hook to supply a single user's settings.
 *
 * @param id User ID of the requested user's settings.
 */
export const useSingleUserSecureSettings = (id: number) => {
  return useQuery<UserSettings, Error>(['users', id, 'settings'], async () => {
    const { data } = await getSingleUserSettings(id);
    return data;
  });
};

/**
 * Custom React Hook to supply a single user's settings.
 *
 * @param id User ID of the requested user's settings.
 */
export const useUsersFavoriteProjects = (id: number) => {
  return useQuery<Project[], Error>(['users', id, 'favorite projects'], async () => {
    const { data } = await getUsersFavoriteProjects(id);
    return data;
  });
};

/**
 * Custom React Hook to update a user's settings.
 */
export const useUpdateUserSettings = () => {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, UserSettings>(
    ['users', user.userId, 'settings', 'update'],
    async (settings: UserSettings) => {
      const { data: userSettingsData } = await updateUserSettings(user.userId, settings);
      const { data: userSecureSettings } = await updateUserSecureSettings(settings);
      return { message: userSettingsData.message + userSecureSettings.message };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users', user.userId, 'settings']);
      }
    }
  );
};

export const useUpdateUserRole = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, UpdateUserRolePayload>(
    ['users', 'change-role'],
    async (updateUserPayload: UpdateUserRolePayload) => {
      if (!auth.user) throw new Error('Update role not allowed when not logged in');
      const { data } = await updateUserRole(updateUserPayload.userId, updateUserPayload.role);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
      }
    }
  );
};
