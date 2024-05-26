/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router';
import { useToggleTheme } from '../../hooks/theme.hooks';
import { useAuth } from '../../hooks/auth.hooks';
import { routes } from '../../utils/routes';
import LoginPage from './LoginPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useQuery } from '../../hooks/utils.hooks';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { useOrganization } from '../../hooks/organization.hooks';

/**
 * Page for unauthenticated users to do login.
 */
const Login = () => {
  const [devUserId, setDevUserId] = useState(1);
  const history = useHistory();
  const query = useQuery();
  const theme = useToggleTheme();
  const auth = useAuth();
  const organizationContext = useOrganization();

  if (auth.isLoading) return <LoadingIndicator />;

  /**
   * Produce the path of the page redirected from the login page.
   * @param queryArgs the query args sent from the login page, containing page, value1, value2, ..., and other args
   * @returns the path, with args, redirected to
   */
  const redirectQueryArgsToPath = (queryArgs: URLSearchParams): string => {
    const pageName: string = queryArgs.get('page')!;
    queryArgs.delete('page');

    const intermediatePathValues: string[] = [];
    for (let valueIdx = 1; queryArgs.has(`value${valueIdx}`); valueIdx++) {
      // collect all the &valueX=... args, in order, from login query args
      intermediatePathValues.push(`/${queryArgs.get(`value${valueIdx}`)!}`);
      queryArgs.delete(`value${valueIdx}`);
    }

    const pathString: string = `/${pageName}${intermediatePathValues.join('')}`;
    return `${pathString}?${queryArgs.toString()}`;
  };

  const redirectAfterLogin = () => {
    if (!query.has('page')) {
      history.push(routes.HOME);
    } else {
      history.push(redirectQueryArgsToPath(query));
    }
  };

  const devFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const authedUser = await auth.devSignin(devUserId);
    if (authedUser.defaultTheme && authedUser.defaultTheme.toLocaleLowerCase() !== theme.activeTheme) {
      theme.toggleTheme();
    }
    if (authedUser.organizations.length > 0) {
      const [defaultOrganization] = authedUser.organizations;
      organizationContext.selectOrganization(defaultOrganization);
    }
    redirectAfterLogin();
  };

  const verifyLogin = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    if (response.code) {
      throw new Error('Invalid login object');
    }
    const { id_token } = (response as GoogleLoginResponse).getAuthResponse();
    if (!id_token) throw new Error('Invalid login object');
    const authedUser = await auth.signin(id_token);
    if (authedUser.defaultTheme && authedUser.defaultTheme !== theme.activeTheme.toUpperCase()) {
      theme.toggleTheme();
    }
    if (authedUser.organizations.length > 0) {
      const [defaultOrganization] = authedUser.organizations;
      organizationContext.selectOrganization(defaultOrganization);
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
