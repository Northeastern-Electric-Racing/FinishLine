import { Box, Grid, TableCell, TableRow, Typography } from '@mui/material';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ManufacturerDeleteButton from '../../../components/ManufacturerDeleteButton';
import { NERButton } from '../../../components/NERButton';
import { useGetAllManufacturers } from '../../../hooks/bom.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import AdminToolTable from '../AdminToolTable';
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
      <TableCell sx={{ border: '2px solid black' }}>
        <Grid container justifyContent="space-between">
          <Grid sx={{ align: 'left' }}>{manufacturer.name}</Grid>
          <Grid>
            <ManufacturerDeleteButton />
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateManufacturerModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <Typography variant="subtitle1">Registered Manufacturers</Typography>
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
