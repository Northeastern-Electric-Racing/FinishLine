import { TableRow, TableCell, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import AdminToolTable from '../AdminToolTable';
import { useGetAllManufacturers } from '../../../hooks/bom.hooks';
import CreateManufacturerModal from './CreateManufacturerFormModal';

const ManufacturerTable: React.FC = () => {
  const {
    data: manufactureres,
    isLoading: manufactureresIsLoading,
    isError: manufacturersIsError,
    error: manufacturersError
  } = useGetAllManufacturers();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);

  if (!manufactureres || manufactureresIsLoading) {
    return <LoadingIndicator />;
  }
  if (manufacturersIsError) {
    return <ErrorPage message={manufacturersError?.message} />;
  }

  const manufacturersTableRows = manufactureres.map((manufacturer) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(manufacturer.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{manufacturer.name}</TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateManufacturerModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <AdminToolTable columns={[{ name: 'Date Registered' }, { name: 'Manufacturer Name' }]} rows={manufacturersTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Manufacturer
        </NERButton>
      </Box>
    </Box>
  );
};

export default ManufacturerTable;
