/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllTeams } from '../../hooks/teams.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import ErrorPage from '../ErrorPage';
import TeamSummary from './TeamSummary';

const TeamsPage: React.FC = () => {
  const { isLoading, isError, data: teams, error } = useAllTeams();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  console.log(JSON.stringify(teams));

  return (
    <>
      <PageTitle title={'Teams'} previousPages={[]} />
      <Grid container spacing={2}>
        {teams?.map((team) => (
          <Grid item key={team.teamId}>
            <Typography>
              <TeamSummary team={team} />
            </Typography>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default TeamsPage;
