/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useContext } from 'react';
import { AuthenticatedUser, User } from 'shared';
import { AuthContext } from '../app/app-context-auth/app-context-auth';
import { useLogUserIn } from './users.hooks';
import { Auth } from '../types';

// Provider hook that creates auth object and handles state
export const useProvideAuth = () => {
  const { isLoading, mutateAsync } = useLogUserIn();
  const [user, setUser] = useState<AuthenticatedUser | undefined>(undefined);

  const devSignin = (user: User) => {
    setUser(user);
    return user;
  };

  const signin = async (id_token: string) => {
    const user = await mutateAsync(id_token);
    setUser(user);
    return user;
  };

  const signout = () => {
    setUser(undefined);
  };

  return {
    user,
    devSignin,
    signin,
    signout,
    isLoading
  } as Auth;
};

// Hook for child components to get the auth object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw Error('Auth must be used inside of context.');
  return context;
};
