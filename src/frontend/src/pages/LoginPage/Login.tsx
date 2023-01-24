/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useHistory } from 'react-router';
import { useToggleTheme } from '../../hooks/theme.hooks';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import LoginPage from './LoginPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useQuery } from '../../hooks/utils.hooks';

/**
 * Page for unauthenticated users to do login.
 */
const Login = () => {
  const [devUserId, setDevUserId] = useState(1);
  const history = useHistory();
  const query = useQuery();
  const theme = useToggleTheme();
  const auth = useAuth();

  if (auth.isLoading) return <LoadingIndicator />;

  const redirectAfterLogin = () => {
    if (!query.has('page')) {
      history.push(routes.HOME);
    } else {
      const pageName: string = query.get('page')!;
      query.delete('page');
      const intermediatePathValues: string[] = [];
      for (let valueIdx = 1; query.has(`value${valueIdx}`); valueIdx++) {
        // get all the &valueX=... args from login query args
        intermediatePathValues.push(`/${query.get(`value${valueIdx}`)!}`);
        query.delete(`value${valueIdx}`);
      }
      const pathString: string = `/${pageName}${intermediatePathValues.join('')}`;
      history.push(`${pathString}?${query.toString()}`);
    }
  };

  const devFormSubmit = async (e: any) => {
    e.preventDefault();
    const authedUser = await auth.devSignin(devUserId);
    if (authedUser.defaultTheme && authedUser.defaultTheme.toLocaleLowerCase() !== theme.activeTheme) {
      theme.toggleTheme();
    }
    redirectAfterLogin();
  };

  const verifyLogin = async (response: any) => {
    const { id_token } = response.getAuthResponse();
    if (!id_token) throw new Error('Invalid login object');
    const authedUser = await auth.signin(id_token);
    if (authedUser.defaultTheme && authedUser.defaultTheme !== theme.activeTheme.toUpperCase()) {
      theme.toggleTheme();
    }
    redirectAfterLogin();
  };

  const handleFailure = (response: any) => {
    console.log(response);
  };

  return (
    <LoginPage
      devSetUser={setDevUserId}
      devFormSubmit={devFormSubmit}
      prodSuccess={verifyLogin}
      prodFailure={handleFailure}
    />
  );
};

export default Login;
