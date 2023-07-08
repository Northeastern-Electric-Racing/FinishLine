/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Switch, Route, Redirect, useHistory, RouteComponentProps } from 'react-router-dom';
import { useAuth } from '../hooks/auth.hooks';
import { routes } from '../utils/routes';
import Login from '../pages/LoginPage/Login';
import AppAuthenticated from './AppAuthenticated';
import { useProvideThemeToggle } from '../hooks/theme.hooks';
import LoadingIndicator from '../components/LoadingIndicator';

const AppPublic: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const theme = useProvideThemeToggle();
  const devUserId = localStorage.getItem('devUserId');
  const render: ((props: RouteComponentProps) => React.ReactNode) | undefined = (e) => {
    // if logged in, go to authenticated app
    if (auth.user) {
      if (auth.user.defaultTheme && auth.user.defaultTheme.toLocaleLowerCase() !== theme.activeTheme) {
        theme.toggleTheme();
      }

      return <AppAuthenticated userId={auth.user.userId} />;
    }

    // if we're on development and the userId is stored in localStorage,
    // then dev login right away (no login page redirect needed!)
    if (import.meta.env.MODE === 'development' && devUserId) {
      auth.devSignin(parseInt(devUserId));
      return <LoadingIndicator />;
    }

    // otherwise, the user needs to login manually
    // prepare query args to store path after login
    const redirectPathParts: string[] = history.location.pathname.split('/').slice(1);

    // if the path ended in an trailing '/' we don't want to clutter the query args with empty param
    if (redirectPathParts[redirectPathParts.length - 1] === '') redirectPathParts.pop();

    const redirectPathQueryArgs: string =
      redirectPathParts.length === 0
        ? ''
        : redirectPathParts
            .slice(1) // "valueX=" starts from second part of the path
            .reduce(
              (prevArgs: string, pathPart: string, idx: number): string => `${prevArgs}&value${idx + 1}=${pathPart}`,
              `?page=${redirectPathParts[0]}`
            );

    const redirectQueryArgs =
      redirectPathQueryArgs + (history.location.search.length > 0 ? `&${history.location.search.slice(1)}` : '');

    return (
      <Redirect
        to={{
          pathname: routes.LOGIN,
          search: redirectQueryArgs,
          state: { from: e.location }
        }}
      />
    );
  };

  return (
    <Switch>
      <Route path={routes.LOGIN}>
        <Login />
      </Route>
      <Route path="*" render={render} />
    </Switch>
  );
};

export default AppPublic;
