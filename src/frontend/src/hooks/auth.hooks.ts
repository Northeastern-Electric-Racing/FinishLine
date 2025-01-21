/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useContext, useEffect } from 'react';
import { AuthenticatedUser } from 'shared';
import { AuthContext } from '../app/AppContextAuth';
import { useGetCurrentUser, useLogUserIn, useLogUserInDev } from './users.hooks';
import { Auth } from '../utils/types';

// Provider hook that creates auth object and handles state
export const useProvideAuth = () => {
  const { isLoading, mutateAsync } = useLogUserIn();
  const { isLoading: isLoadingDev, mutateAsync: mutateAsyncDev } = useLogUserInDev();
  const [user, setUser] = useState<AuthenticatedUser | undefined>(undefined);
  const { data: authUser, isLoading: currentUserIsLoading } = useGetCurrentUser();

  useEffect(() => {
    if (authUser && !user) {
      setUser(authUser);
    }
  }, [authUser, currentUserIsLoading, user]);

  console.log(authUser, currentUserIsLoading);

  const devSignin = async (userId: string) => {
    const user = await mutateAsyncDev(userId);
    setUser(user);
    localStorage.setItem('devUserId', userId.toString());
    return user;
  };

  const signin = async (id_token: string) => {
    const user = await mutateAsync(id_token);
    setUser(user);
    return user;
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
    setUser,
    isLoading: isLoading || isLoadingDev || currentUserIsLoading
  } as Auth;
};

// Hook for child components to get the auth object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw Error('Auth must be used inside of context.');
  return context;
};
