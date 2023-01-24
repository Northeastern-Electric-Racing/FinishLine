/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/auth.hooks';
import { routes } from '../utils/routes';
import Login from '../pages/LoginPage/Login';
import AppAuthenticated from './AppAuthenticated';
import { useProvideThemeToggle } from '../hooks/theme.hooks';

const AppPublic: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const theme = useProvideThemeToggle();

  const devUserId = localStorage.getItem('devUserId');

  const render = (e: any) => {
    // if logged in, go to authenticated app
    if (auth.user) {
      if (auth.user.defaultTheme && auth.user.defaultTheme.toLocaleLowerCase() !== theme.activeTheme) {
        theme.toggleTheme();
      }

      return <AppAuthenticated />;
    }

    // if we're on development and the userId is stored in localStorage,
    // then dev login right away (no login page redirect needed!)
    if (process.env.NODE_ENV === 'development' && devUserId) {
      auth.devSignin(parseInt(devUserId));
      return <AppAuthenticated />;
    }

    // otherwise, the user needs to login manually
    // prepare query args to store path after login
    const pathParts: string[] = history.location.pathname.split('/').slice(1);
    // if the URL ended in an extra '/' we don't want to clutter the query args
    if (pathParts[pathParts.length - 1] === '') pathParts.pop();
    const asQueryArg = (pathPart: string, idx: number): string => {
      if (idx === 0) return `page=${pathPart}`;
      else return `value${idx}=${pathPart}`;
    };
    const pathArgs: string = `?${pathParts.map(asQueryArg).join('&')}`;
    return (
      <Redirect
        to={{
          pathname: routes.LOGIN,
          search: pathArgs + (history.location.search ? `&${history.location.search.slice(1)}` : ''),
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
