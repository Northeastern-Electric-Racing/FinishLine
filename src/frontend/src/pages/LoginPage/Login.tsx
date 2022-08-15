/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { useHistory } from 'react-router';
import { RoleEnum } from 'shared';
import { exampleAllUsers } from '../../tests/TestSupport/TestData/Users.stub';
import { useTheme } from '../../hooks/Theme.hooks';
import { useAuth } from '../../hooks/Auth.hooks';
import { routes } from '../../utils/Routes';
import LoginPage from './LoginPage';
import LoadingIndicator from '../../components/LoadingIndicator';

interface LoginProps {
  postLoginRedirect: { url: string; search: string };
}

/**
 * Page for unauthenticated users to do login.
 */
const Login: React.FC<LoginProps> = ({ postLoginRedirect }) => {
  const [devUserRole, setDevUserRole] = useState<string>(RoleEnum.APP_ADMIN as string);
  const history = useHistory();
  const theme = useTheme();
  const auth = useAuth();

  if (auth.isLoading) return <LoadingIndicator />;

  const redirectAfterLogin = () => {
    if (postLoginRedirect.url === routes.LOGIN) {
      history.push(routes.HOME);
    } else {
      history.push(`${postLoginRedirect.url}${postLoginRedirect.search}`);
    }
  };

  const devFormSubmit = (e: any) => {
    e.preventDefault();
    const user = exampleAllUsers.find((u) => u.role === devUserRole);
    if (!user) throw new Error('user for dev not found from role: ' + devUserRole);
    auth.devSignin(user!);
    redirectAfterLogin();
  };

  const verifyLogin = async (response: any) => {
    const { id_token } = response.getAuthResponse();
    if (!id_token) throw new Error('Invalid login object');
    const authedUser = await auth.signin(id_token);
    if (authedUser.defaultTheme && authedUser.defaultTheme !== theme.name) {
      theme.toggleTheme!(authedUser.defaultTheme);
    }
    redirectAfterLogin();
  };

  const handleFailure = (response: any) => {
    console.log(response);
  };

  return (
    <LoginPage
      devSetRole={setDevUserRole}
      devFormSubmit={devFormSubmit}
      prodSuccess={verifyLogin}
      prodFailure={handleFailure}
      theme={theme}
    />
  );
};

export default Login;
