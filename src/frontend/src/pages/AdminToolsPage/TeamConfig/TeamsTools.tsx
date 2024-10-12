import { Box, Grid, TableCell, TableRow, Typography } from '@mui/material';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { fullNamePipe } from '../../../utils/pipes';
import AdminToolTable from '../AdminToolTable';

import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import CreateTeamForm from './CreateTeamForm';
import TeamTypeTable from './TeamTypeTable';

const TeamsTools = () => {
  const {
    data: allTeams,
    isLoading: allTeamsIsLoading,
    isError: allTeamsIsError,
    error: allTeamsError
  } = useAllTeams();

  if (!allTeams || allTeamsIsLoading) return <LoadingIndicator />;

  if (allTeamsIsError) {
    return <ErrorPage message={allTeamsError.message} />;
  }

  const teamTableRows = allTeams.map((team) => (
    <TableRow component={RouterLink} to={`${routes.TEAMS}/${team.teamId}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
      <TableCell sx={{ border: '2px solid black' }}>{team.teamName}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{fullNamePipe(team.head)}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        {team.members.length}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Team Management
      </Typography>
      <Grid container columnSpacing={2}>
        <Grid item xs={12} md={6}>
          <CreateTeamForm />
        </Grid>
        <Grid item xs={12} md={6} sx={{ marginTop: '24px' }}>
          <AdminToolTable
            columns={[{ name: 'Team Name' }, { name: 'Head' }, { name: 'Members', width: '20%' }]}
            rows={teamTableRows}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: '24px', marginBottom: '24px' }}>
          <TeamTypeTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamsTools;
