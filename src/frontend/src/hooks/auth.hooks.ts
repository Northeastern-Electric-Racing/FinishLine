/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useContext } from 'react';
import { AuthenticatedUser } from 'shared';
import { AuthContext } from '../app/AppContextAuth';
import { useLogUserIn, useLogUserInDev } from './users.hooks';
import { Auth } from '../utils/types';
import { useToast } from './toasts.hooks';

// Provider hook that creates auth object and handles state
export const useProvideAuth = () => {
  const { isLoading, mutateAsync } = useLogUserIn();
  const { isLoading: isLoadingDev, mutateAsync: mutateAsyncDev } = useLogUserInDev();
  const [user, setUser] = useState<AuthenticatedUser | undefined>(undefined);
  const toast = useToast();

  const devSignin = async (userId: number) => {
    try {
      const user = await mutateAsyncDev(userId);
      setUser(user);
      localStorage.setItem('devUserId', userId.toString());
      return user;
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const signin = async (id_token: string) => {
    try {
      const user = await mutateAsync(id_token);
      setUser(user);
      return user;
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const signout = () => {
    localStorage.setItem('devUserId', '');
    setUser(undefined);
  };

  return {
    user,
    devSignin,
    signin,
    signout,
    isLoading: isLoading || isLoadingDev
  } as Auth;
};

// Hook for child components to get the auth object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw Error('Auth must be used inside of context.');
  return context;
};
