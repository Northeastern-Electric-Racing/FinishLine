/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllTeams } from '../../hooks/teams.hooks';
import ErrorPage from '../ErrorPage';
import TeamSummary from './TeamSummary';
import PageLayout from '../../components/PageLayout';

const TeamsPage: React.FC = () => {
  const { isLoading, isError, data: teams, error } = useAllTeams();

  if (isLoading || !teams) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <PageLayout title="Teams">
      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid item key={team.teamId}>
            <TeamSummary team={team} />
          </Grid>
        ))}
      </Grid>
    </PageLayout>
  );
};

export default TeamsPage;