/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllTeams } from '../../hooks/teams.hooks';
import ErrorPage from '../ErrorPage';
import TeamSummary from './TeamSummary';
import PageLayout from '../../components/PageLayout';

const TeamsPage: React.FC = () => {
  const { isLoading, isError, data: teams, error } = useAllTeams();

  const archivedTeams = teams?.filter((team) => team.dateArchived);

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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              {/* Add more headers as needed */}
            </TableRow>
          </TableHead>
          <TableBody>
            {archivedTeams?.map((team) => (
              <TableRow key={team.teamId}>
                <TableCell align="left" sx={{ border: '2px solid black' }}>
                  {team.teamName}
                </TableCell>
                {/* Add more cells for additional columns */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageLayout>
  );
};

export default TeamsPage;
