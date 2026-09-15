/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React, { createContext, useContext } from 'react';
import { useCurrentUser, useSingleUserSettings } from '../../hooks/users.hooks';

interface SlackIdGateContextProps {
  hasSlackId: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const SlackIdGateContext = createContext<SlackIdGateContextProps | undefined>(undefined);

/**
 * Tracks whether the current user has a Slack ID set, without rendering anything itself --
 * consumers decide what to do (e.g. show a popup) once they know the answer. On error, hasSlackId
 * is NOT assumed to be false -- consumers must check isError themselves rather than treating an
 * error as "no Slack ID".
 */
export const SlackIdGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useCurrentUser();
  const { data: userSettings, isLoading, isError, error } = useSingleUserSettings(user.userId);
  const hasSlackId = !!userSettings?.slackId;

  return (
    <SlackIdGateContext.Provider value={{ hasSlackId, isLoading, isError, error }}>{children}</SlackIdGateContext.Provider>
  );
};

export const useSlackIdGate = () => {
  const context = useContext(SlackIdGateContext);
  if (!context) {
    throw new Error('useSlackIdGate must be used within a SlackIdGateProvider');
  }
  return context;
};
