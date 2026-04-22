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

  if (isGuest(user.role)) {
    if (teamTypes?.some((t) => t.teamTypeId === teamId)) {
      return <GuestTeamPage teamTypeId={teamId} />;
    }
    return <GuestTeamSpecificPage />;
  }
  return <TeamSpecificPage />;
};

const GuestOrMemberTeamsPage: React.FC = () => {
  const user = useCurrentUser();
  if (isGuest(user.role)) return <GuestDivisionPage />;
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
