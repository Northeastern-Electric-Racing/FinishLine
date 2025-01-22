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
import { useCurrentUser } from '../../hooks/users.hooks';
import IntroGuestHomePage from './IntroGuestHomePage';
import { isGuest } from 'shared';

const Home: React.FC = () => {
  const user = useCurrentUser();

  const onOnboarding = user.onboardingTeamTypeIds.length > 0;
  const completedOnboarding = user.onboardedTeamTypeIds.length > 0;

  return (
    <Switch>
      {completedOnboarding &&
        [routes.HOME_GUEST, routes.HOME_PNM, routes.HOME_ONBOARDING, routes.HOME_ACCEPT].map((path) => (
          <Redirect exact path={path} to={routes.HOME} />
        ))}
      {!onOnboarding && !completedOnboarding && !isGuest(user.role) && (
        <Redirect exact path={routes.HOME} to={routes.HOME_GUEST} />
      )}
      {onOnboarding && <Redirect exact path={routes.HOME} to={routes.HOME_PNM} />}
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
