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
    return (
      <Redirect
        to={{
          pathname: routes.LOGIN,
          state: { from: e.location }
        }}
      />
    );
  };

  return (
    <Switch>
      <Route path={routes.LOGIN}>
        <Login postLoginRedirect={{ url: history.location.pathname, search: history.location.search }} />
      </Route>
      <Route path="*" render={render} />
    </Switch>
  );
};

export default AppPublic;
