import { TableRow, TableCell, Box, IconButton } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import AdminToolTable from '../AdminToolTable';
import { useGetAllUnits, useDeleteUnit } from '../../../hooks/bom.hooks';
import CreateUnitFormModal from './CreateUnitFormModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../../../hooks/toasts.hooks';

const UnitTypeTable: React.FC = () => {
  const {
    data: unitTypes,
    isLoading: unitTypesIsLoading,
    isError: unitTypesIsError,
    error: unitTypesError
  } = useGetAllUnits();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const toast = useToast();
  const { mutateAsync: deleteUnit } = useDeleteUnit();

  if (!unitTypes || unitTypesIsLoading) {
    return <LoadingIndicator />;
  }
  if (unitTypesIsError) {
    return <ErrorPage message={unitTypesError?.message} />;
  }

  const handleDeleteUnit = (id: string) => {
    try {
      deleteUnit(id);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const unitTypesTableRows = unitTypes.map((unitType) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {unitType.name}
      </TableCell>
      <TableCell align="center" sx={{ width: 10, border: '2px solid black' }}>
        <IconButton
          type="button"
          sx={{
            mx: 1
          }}
          onClick={() => handleDeleteUnit(unitType.name)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateUnitFormModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <AdminToolTable columns={[{ name: 'Unit' }]} rows={unitTypesTableRows} />
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
