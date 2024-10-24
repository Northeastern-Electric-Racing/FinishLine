/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllArchivedTeams, useAllTeams } from '../../hooks/teams.hooks';
import ErrorPage from '../ErrorPage';
import TeamSummary from './TeamSummary';
import PageLayout from '../../components/PageLayout';

const TeamsPage: React.FC = () => {
  const { isLoading: teamsLoading, isError: isTeamsError, data: teams, error: teamsError } = useAllTeams();

  const {
    isLoading: archivedTeamsLoading,
    isError: isArchivedTeamsError,
    data: archivedTeams,
    error: archivedTeamsError
  } = useAllArchivedTeams();
  console.log(archivedTeams);

  if (teamsLoading || !teams) return <LoadingIndicator />;
  if (archivedTeamsLoading || !archivedTeams) return <LoadingIndicator />;

  if (isArchivedTeamsError) return <ErrorPage message={archivedTeamsError?.message} />;
  if (isTeamsError) return <ErrorPage message={teamsError?.message} />;

  return (
    <>
      <PageLayout title="Teams">
        <Grid container spacing={2}>
          {teams.map((team) => (
            <Grid item key={team.teamId}>
              <TeamSummary team={team} />
            </Grid>
          ))}
        </Grid>
      </PageLayout>
      <PageLayout title="Archived Teams">
        <Grid container spacing={2}>
          {archivedTeams.map((archivedTeam) => (
            <Grid item key={archivedTeam.teamId}>
              <TeamSummary team={archivedTeam} />
            </Grid>
          ))}
        </Grid>
      </PageLayout>
    </>
  );
};

export default TeamsPage;
