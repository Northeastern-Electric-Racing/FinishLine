/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useContext, useRef } from 'react';
import { AuthenticatedUser } from 'shared';
import { AuthContext } from '../app/AppContextAuth';
import { useGetCurrentUser, useLogUserIn, useLogUserInDev } from './users.hooks';
import { Auth } from '../utils/types';
import { isServerUnavailableError } from '../utils/axios';

const MAX_CURRENT_USER_RETRY_DELAY_MS = 15000;

export const SERVER_UNAVAILABLE_MESSAGE =
  "We can't reach the FinishLine server right now. We'll keep retrying automatically, so there's no need to sign in again.";

// Provider hook that creates auth object and handles state
export const useProvideAuth = () => {
  const { isLoading, mutateAsync } = useLogUserIn();
  const { isLoading: isLoadingDev, mutateAsync: mutateAsyncDev } = useLogUserInDev();
  const [user, setUser] = useState<AuthenticatedUser | undefined>(undefined);
  const { mutateAsync: getCurrentUser, isLoading: currentUserIsLoading } = useGetCurrentUser();
  const [triedCurrent, setTriedCurrent] = useState(false);
  const [serverUnavailable, setServerUnavailable] = useState(false);
  // signInCurrent is called during render, so this keeps re-renders from starting more retry loops
  const signingInCurrent = useRef(false);

  /**
   * Restores the session from the auth cookie. If the backend is down or restarting, the cookie may still be
   * valid, so keep retrying with backoff instead of sending the user to the login page.
   * @param retryUntilAvailable false to throw when the backend is unavailable instead of retrying, for callers
   * that are refreshing an already signed in user and need to surface the failure
   */
  const signInCurrent = async (retryUntilAvailable = true) => {
    if (signingInCurrent.current) return;
    signingInCurrent.current = true;

    try {
      for (let attempt = 0; ; attempt++) {
        try {
          const user = await getCurrentUser();
          setUser(user);
          return;
        } catch (error: unknown) {
          if (!isServerUnavailableError(error)) {
            console.log(error);
            return;
          }
          if (!retryUntilAvailable) throw error;
          setServerUnavailable(true);
          const delay = Math.min(1000 * 2 ** attempt, MAX_CURRENT_USER_RETRY_DELAY_MS);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } finally {
      signingInCurrent.current = false;
      setServerUnavailable(false);
      setTriedCurrent(true);
    }
  };

  const devSignin = async (userId: string) => {
    try {
      const user = await mutateAsyncDev(userId);
      setUser(user);
      localStorage.setItem('devUserId', userId.toString());
      return user;
    } catch (error) {
      console.log(error);
      localStorage.removeItem('devUserId');
      return;
    }
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
    signInCurrent,
    triedCurrent,
    serverUnavailable,
    isLoading: isLoading || isLoadingDev || (currentUserIsLoading && !triedCurrent)
  } as Auth;
};

// Hook for child components to get the auth object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw Error('Auth must be used inside of context.');
  return context;
};
