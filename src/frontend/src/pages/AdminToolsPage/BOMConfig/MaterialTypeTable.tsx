import { TableRow, TableCell, Typography, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import AdminToolTable from '../AdminToolTable';
import { useGetAllMaterialTypes } from '../../../hooks/bom.hooks';
import CreateMaterialTypeModal from './CreateMaterialTypeFormModal';

const MaterialTypeTable: React.FC = () => {
  const {
    data: materialTypes,
    isLoading: materialTypesIsLoading,
    isError: materialTypesIsError,
    error: materialTypesError
  } = useGetAllMaterialTypes();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);

  if (!materialTypes || materialTypesIsLoading) {
    return <LoadingIndicator />;
  }
  if (materialTypesIsError) {
    return <ErrorPage message={materialTypesError?.message} />;
  }

  const materialTypesTableRows = materialTypes.map((materialType) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(materialType.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{materialType.name}</TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateMaterialTypeModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <Typography variant="subtitle1">Registered Material Types</Typography>
      <AdminToolTable columns={[{ name: 'Date Registered' }, { name: 'Material Type' }]} rows={materialTypesTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Material Type
        </NERButton>
      </Box>
    </Box>
  );
};

export default MaterialTypeTable;
