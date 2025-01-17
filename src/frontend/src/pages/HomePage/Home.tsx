/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Redirect, Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import PNMHomePage from './PNMHomePage';
import OnboardingHomePage from './OnboardingHomePage';
import SelectSubteamPage from './SelectSubteamPage';
import AcceptedPage from '../AcceptedPage/AcceptedPage';
import HomePage from './HomePage';
import { isGuest } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import IntroGuestHomePage from './IntroGuestHomePage';

const Home: React.FC = () => {
  const user = useCurrentUser();

  const onOnboarding = user.onboardingTeamTypeIds.length > 0;
  const userRole = user.role;

  return (
    <Switch>
      {!onOnboarding && isGuest(userRole) && <Redirect exact path={routes.HOME} to={routes.HOME_GUEST} />}
      {!onOnboarding && <Redirect exact path={routes.HOME_ACCEPT} to={routes.HOME} />}
      {onOnboarding && <Redirect exact path={routes.HOME} to={routes.HOME_SELECT_SUBTEAM} />}
      {!isGuest(userRole) && <Redirect exact path={routes.HOME_GUEST} to={routes.HOME} />}
      {!isGuest(userRole) && <Redirect exact path={routes.HOME_PNM} to={routes.HOME} />}
      {!isGuest(userRole) && <Redirect exact path={routes.HOME_ONBOARDING} to={routes.HOME} />}
      <Route exact path={routes.HOME_SELECT_SUBTEAM} component={SelectSubteamPage} />
      <Route exact path={routes.HOME_ACCEPT} component={AcceptedPage} />
      <Route exact path={routes.HOME_ONBOARDING} component={OnboardingHomePage} />
      <Route exact path={routes.HOME_PNM} component={PNMHomePage} />
      <Route exact path={routes.HOME_MEMBER} component={HomePage} />
      <Route exact path={routes.HOME_GUEST} component={IntroGuestHomePage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  );
};

export default Home;
