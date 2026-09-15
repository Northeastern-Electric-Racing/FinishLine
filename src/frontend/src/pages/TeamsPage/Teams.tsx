/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Route, Switch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import TeamsPage from './TeamsPage';
import TeamSpecificPage from './TeamSpecificPage';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isGuest } from 'shared';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import GuestTeamPage from '../GuestTeamsPage/GuestTeamPage';
import GuestDivisionPage from '../GuestDivisionsPage/GuestDivisionPage';
import GuestTeamSpecificPage from '../GuestTeamsPage/GuestTeamSpecificPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const TeamOrDivisionPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const user = useCurrentUser();
  const { isLoading: teamsLoading, isError: isTeamsError, data: teamTypes, error: teamsError } = useAllTeamTypes();

  if (isTeamsError) return <ErrorPage message={teamsError.message} />;
  if (teamsLoading || !teamTypes) return <LoadingIndicator />;

  // a teamTypeId (division) in the URL always means "show that division's team list", regardless
  // of the viewer's onboarding status -- this can never be a valid team id
  if (teamTypes.some((teamType) => teamType.teamTypeId === teamId)) {
    return <GuestTeamPage teamTypeId={teamId} />;
  }

  // guests who've already finished onboarding are "new members" -- they get the full teams
  // experience (including the ability to request to join a team), not the limited guest preview
  const isPreOnboardingGuest = isGuest(user.role) && user.onboardedTeamTypeIds.length === 0;

  if (isPreOnboardingGuest) return <GuestTeamSpecificPage />;
  return <TeamSpecificPage />;
};

const GuestOrMemberTeamsPage: React.FC = () => {
  const user = useCurrentUser();
  const isPreOnboardingGuest = isGuest(user.role) && user.onboardedTeamTypeIds.length === 0;
  if (isPreOnboardingGuest) return <GuestDivisionPage />;
  return <TeamsPage />;
};

const Teams: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.TEAMS_BY_ID} component={TeamOrDivisionPage} />
      <Route path={routes.TEAMS} component={GuestOrMemberTeamsPage} />
    </Switch>
  );
};

export default Teams;
