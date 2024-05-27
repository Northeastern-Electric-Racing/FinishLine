import { TableRow, TableCell, Box, Typography, Icon } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import AdminToolTable from '../AdminToolTable';
import CreateTeamTypeModal from './CreateTeamTypeFormModal';
import { useAllTeamTypes } from '../../../hooks/design-reviews.hooks';

const TeamTypeTable: React.FC = () => {
  const {
    data: teamTypes,
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    error: teamTypesError
  } = useAllTeamTypes();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);

  if (!teamTypes || teamTypesIsLoading) {
    return <LoadingIndicator />;
  }
  if (teamTypesIsError) {
    return <ErrorPage message={teamTypesError?.message} />;
  }

  const teamTypesTableRows = teamTypes.map((teamType) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black' }}>{teamType.name}</TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon>{teamType.iconName}</Icon>
          <Typography variant="body1" sx={{ marginLeft: 1 }}>
            {teamType.iconName}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateTeamTypeModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <AdminToolTable columns={[{ name: 'Team Type Name' }, { name: 'Icon' }]} rows={teamTypesTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Team Type
        </NERButton>
      </Box>
    </Box>
  );
};

export default TeamTypeTable;
