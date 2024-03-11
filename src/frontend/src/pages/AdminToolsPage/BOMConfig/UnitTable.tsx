import { TableRow, TableCell, Typography, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
// import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import AdminToolTable from '../AdminToolTable';
import { useGetAllUnits } from '../../../hooks/bom.hooks';
import CreateUnitFormModal from './CreateUnitFormModal';

const UnitTypeTable: React.FC = () => {
  const {
    data: unitTypes,
    isLoading: unitTypesIsLoading,
    isError: unitTypesIsError,
    error: unitTypesError
  } = useGetAllUnits();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);

  if (!unitTypes || unitTypesIsLoading) {
    return <LoadingIndicator />;
  }
  if (unitTypesIsError) {
    return <ErrorPage message={unitTypesError?.message} />;
  }

  const unitTypesTableRows = unitTypes.map((unitType) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}></TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{unitType.name}</TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateUnitFormModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <Typography variant="subtitle1">Registered Units</Typography>
      <AdminToolTable columns={[{ name: 'Date Registered' }, { name: 'Unit' }]} rows={unitTypesTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Unit
        </NERButton>
      </Box>
    </Box>
  );
};

export default UnitTypeTable;
