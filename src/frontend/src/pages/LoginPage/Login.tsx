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

interface LoginProps {
  postLoginRedirect: { url: string; search: string };
}

/**
 * Page for unauthenticated users to do login.
 */
const Login: React.FC<LoginProps> = ({ postLoginRedirect }) => {
  const [devUserId, setDevUserId] = useState(1);
  const history = useHistory();
  const theme = useToggleTheme();
  const auth = useAuth();

  if (auth.isLoading) return <LoadingIndicator />;

  const redirectAfterLogin = () => {
    if (postLoginRedirect.url === routes.LOGIN) {
      history.push(routes.HOME);
    } else {
      history.push(`${postLoginRedirect.url}${postLoginRedirect.search}`);
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
