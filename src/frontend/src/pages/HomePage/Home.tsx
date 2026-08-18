/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Redirect, Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import PNMHomePage from './PNMHomePage';
import OnboardingHomePage from './OnboardingHomePage';
import NewMemberHomePage from './NewMemberHomePage';
import SelectSubteamPage from './SelectSubteamPage';
import HomePage from './HomePage';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useGetUsersTeams } from '../../hooks/teams.hooks';
import IntroGuestHomePage from './IntroGuestHomePage';
import { isAdmin, isGuest } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const Home: React.FC = () => {
  const user = useCurrentUser();
  const { data: teams, isLoading: teamsIsLoading, isError: teamsIsError, error: teamsError } = useGetUsersTeams();

  const onOnboarding = user.onboardingTeamTypeIds.length > 0;
  const completedOnboarding = user.onboardedTeamTypeIds.length > 0;

  if (teamsIsError) return <ErrorPage message={teamsError.message} />;
  if (teamsIsLoading || !teams) return <LoadingIndicator />;

  // a new member stays on their own dashboard until they join a team -- the moment they're added
  // (approval adds them to team.members immediately) they graduate to the standard dashboard
  const isNewMember = completedOnboarding && isGuest(user.role) && teams.length === 0;

  return (
    <Switch>
      {completedOnboarding &&
        !isNewMember &&
        !isAdmin(user.role) &&
        [routes.HOME_PNM, routes.HOME_ONBOARDING, routes.HOME_NEW_MEMBER].map((path) => (
          <Redirect exact key={path} path={path} to={routes.HOME} />
        ))}
      {/* new members can still visit HOME_ONBOARDING to look back at what they completed */}
      {isNewMember && <Redirect exact path={routes.HOME_PNM} to={routes.HOME_NEW_MEMBER} />}
      {onOnboarding && !completedOnboarding && <Redirect exact path={routes.HOME} to={routes.HOME_PNM} />}
      {isNewMember && <Redirect exact path={routes.HOME} to={routes.HOME_NEW_MEMBER} />}
      <Route exact path={routes.HOME_SELECT_SUBTEAM} component={SelectSubteamPage} />
      <Route exact path={routes.HOME_ONBOARDING} component={OnboardingHomePage} />
      <Route exact path={routes.HOME_NEW_MEMBER} component={NewMemberHomePage} />
      <Route exact path={routes.HOME_PNM} component={PNMHomePage} />
      <Route exact path={routes.HOME_MEMBER} component={HomePage} />
      {!onOnboarding && !completedOnboarding && isGuest(user.role) && (
        <Route exact path={routes.HOME} component={IntroGuestHomePage} />
      )}
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  );
};

export default Home;
