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
  updateUserSecureSettings,
  getCurrentUserSecureSettings,
  getUserSecureSettings,
  getUserScheduleSettings,
  updateUserScheduleSettings
} from '../apis/users.api';
import {
  User,
  AuthenticatedUser,
  UserSettings,
  UpdateUserRolePayload,
  Project,
  UserSecureSettings,
  UserScheduleSettings,
  UserWithScheduleSettings
} from 'shared';
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
  return useQuery<UserWithScheduleSettings[], Error>(['users'], async () => {
    const { data } = await getAllUsers();
    return data;
  });
};

/**
 * Custom React Hook to supply a single user.
 *
 * @param id User ID of the requested user.
 */
export const useSingleUser = (id: string) => {
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
  return useMutation<AuthenticatedUser, Error, string>(['users', 'login'], async (userId: string) => {
    const { data } = await logUserInDev(userId);
    return data;
  });
};

/**
 * Custom React Hook to supply a single user's settings.
 *
 * @param id User ID of the requested user's settings.
 */
export const useSingleUserSettings = (id: string) => {
  return useQuery<UserSettings, Error>(['users', id, 'settings'], async () => {
    const { data } = await getSingleUserSettings(id);
    return data;
  });
};

/**
 * Custom React Hook to supply the current user's secure settings
 */
export const useCurrentUserSecureSettings = () => {
  return useQuery<UserSecureSettings, Error>(['users', 'secure-settings'], async () => {
    try {
      const { data } = await getCurrentUserSecureSettings();
      return data;
    } catch (error: unknown) {
      return { userSecureSettingsId: '', nuid: '', street: '', city: '', state: '', zipcode: '', phoneNumber: '' };
    }
  });
};

/**
 * Custom React Hook to supply a single user's secure settings
 *
 * @param id User ID of the requested user's secure settings
 * @returns the user's secure settings
 */
export const useUserSecureSettings = (id: string) => {
  return useQuery<UserSecureSettings, Error>(['users', id, 'secure-settings'], async () => {
    const { data } = await getUserSecureSettings(id);
    return data;
  });
};

/**
 * Custom React Hook to supply a single user's schedule settings
 *
 * @param id User ID of the requested user's schedule settings
 * @returns the user's schedule settings
 */
export const useUserScheduleSettings = (id: string) => {
  return useQuery<UserScheduleSettings, Error>(['users', id, 'schedule-settings'], async () => {
    try {
      const { data } = await getUserScheduleSettings(id);
      return data;
    } catch (error: unknown) {
      return { drScheduleSettingsId: '', personalGmail: '', personalZoomLink: '', availability: [] };
    }
  });
};

/**
 * Custom React Hook to supply a single user's settings.
 *
 * @param id User ID of the requested user's settings.
 */
export const useUsersFavoriteProjects = (id: string) => {
  return useQuery<Project[], Error>(['users', id, 'favorite projects'], async () => {
    const { data } = await getUsersFavoriteProjects(id);
    return data;
  });
};

/**
 * Custom React Hook to update a user's settings.
 */
export const useUpdateUserSettings = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, UserSettings>(
    ['users', auth.user?.userId!, 'settings', 'update'],
    async (settings: UserSettings) => {
      if (!auth.user) throw new Error('Update settings not allowed when not logged in');
      const { data } = await updateUserSettings(auth.user.userId, settings);
      queryClient.invalidateQueries(['users', auth.user.userId, 'settings']);
      return data;
    }
  );
};

/**
 * Custom Hook to update a user's secure settings
 *
 * @returns The mutation to update a user's secure settings
 */
export const useUpdateUserSecureSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, UserSecureSettings>(
    ['users', 'secure-settings', 'update'],
    async (settings: UserSecureSettings) => {
      const { data } = await updateUserSecureSettings(settings);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users', 'secure-settings']);
      }
    }
  );
};

/**
 * Custom Hook to update a user's schedule settings
 *
 * @returns The mutation to update a user's schedule settings
 */
export const useUpdateUserScheduleSettings = () => {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation<UserScheduleSettings, Error, UserScheduleSettings>(
    ['users', 'schedule-settings', 'update'],
    async (settings: UserScheduleSettings) => {
      const { data } = await updateUserScheduleSettings(settings);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users', user.userId, 'schedule-settings']);
      }
    }
  );
};

/**
 * Custom React Hook to update a user's role.
 */
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
