/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext } from 'react';
import { AuthenticatedUser } from 'shared';
import LoadingIndicator from '../components/LoadingIndicator';
import { useAuth } from '../hooks/auth.hooks';

export const UserContext = createContext<AuthenticatedUser | undefined>(undefined);
export const OrganizationContext = createContext<string | undefined>(undefined);

const AppContextUser: React.FC = (props) => {
  const auth = useAuth();

  if (!auth.user) return <LoadingIndicator />;

  return <UserContext.Provider value={auth.user}>{props.children}</UserContext.Provider>;
};

export default AppContextUser;
