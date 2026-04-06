import { v4 as uuidv4 } from 'uuid';

/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext } from 'react';
import { AuthenticatedUser } from 'shared';
import LoadingIndicator from '../components/LoadingIndicator';
import { useAuth } from '../hooks/auth.hooks';
import { useClarity } from '../hooks/misc.hooks';
import { fullNamePipe } from '../utils/pipes';
import { useGetUsersTeams } from '../hooks/teams.hooks';
import ErrorPage from '../pages/ErrorPage';

export const UserContext = createContext<AuthenticatedUser | undefined>(undefined);

const AppContextUser: React.FC<{ children: React.ReactNode }> = (props) => {
  const auth = useAuth();
  const clarity = useClarity();
  const { data: teams, isLoading: teamsIsLoading, isError: teamsIsError, error: teamsError } = useGetUsersTeams();

  if (!auth.user || teamsIsLoading || !teams) return <LoadingIndicator />;

  if (teamsIsError) return <ErrorPage message={teamsError.message} />;

  if (import.meta.env.VITE_REACT_APP_CLARITY_PROJECT_ID) {
    clarity('consent');
    clarity('identify', auth.user.email, uuidv4(), undefined, fullNamePipe(auth.user));
    clarity('set', 'role', auth.user.role);
    clarity('set', 'finishlineUserId', auth.user.userId);
    clarity(
      'set',
      'team',
      teams.map((team) => team.teamName)
    );
  }

  return <UserContext.Provider value={auth.user}>{props.children}</UserContext.Provider>;
};

export default AppContextUser;
