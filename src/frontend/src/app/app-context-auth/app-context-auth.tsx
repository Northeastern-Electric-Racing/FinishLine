/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext } from 'react';
import { useProvideAuth } from '../../services/auth.hooks';
import { Auth } from '../../types';

export const AuthContext = createContext<Auth | undefined>(undefined);

const AppContextAuth: React.FC = (props) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{props.children}</AuthContext.Provider>;
};

export default AppContextAuth;
