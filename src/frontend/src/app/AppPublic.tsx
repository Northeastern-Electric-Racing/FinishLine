/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/auth.hooks';
import { useTheme } from '../hooks/theme.hooks';
import { routes } from '../utils/Routes';
import Login from '../pages/LoginPage/Login';
import AppAuthenticated from './AppAuthenticated';

const AppPublic: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const theme = useTheme();

  // eslint-disable-next-line prefer-destructuring
  document.body.style.backgroundColor = theme.bgColor;

  return (
    <html className={theme.className}>
      <Switch>
        <Route path={routes.LOGIN}>
          <Login
            postLoginRedirect={{ url: history.location.pathname, search: history.location.search }}
          />
        </Route>
        <Route
          path="*"
          render={({ location }) =>
            auth.user === undefined ? (
              <Redirect
                to={{
                  pathname: routes.LOGIN,
                  state: { from: location }
                }}
              />
            ) : (
              <AppAuthenticated />
            )
          }
        />
      </Switch>
    </html>
  );
};

export default AppPublic;
