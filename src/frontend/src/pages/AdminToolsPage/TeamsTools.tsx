import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { NERButton } from '../../components/NERButton';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { fullNamePipe } from '../../utils/pipes';
import CreateTeamModal from './CreateTeamModal';
import { useState } from 'react';

const TeamsTools = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: allTeams, isLoading, isError, error } = useAllTeams();

  if (!allTeams || isLoading) return <LoadingIndicator />;

  if (isError) {
    return <ErrorPage message={error.message} />;
  }

  const teamTableRows = allTeams.map((team) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black' }}>{team.teamName}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{fullNamePipe(team.head)}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{team.members.length}</TableCell>
    </TableRow>
  ));

  return (
    <PageBlock title="Team Management">
      <CreateTeamModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableCell
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              itemType="date"
              width="50%"
            >
              Team Name
            </TableCell>
            <TableCell
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              itemType="date"
              width="30%"
            >
              Head
            </TableCell>
            <TableCell
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              itemType="date"
              width="30%"
            >
              Number of Members
            </TableCell>
          </TableHead>
          <TableBody>{teamTableRows}</TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setShowCreateModal(true)}>
          New Team
        </NERButton>
      </Box>
    </PageBlock>
  );
};

export default TeamsTools;
