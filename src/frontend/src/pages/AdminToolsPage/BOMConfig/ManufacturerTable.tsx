import { Box, Grid, TableCell, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Manufacturer } from 'shared';
import { deleteManufacturer } from '../../../apis/bom.api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { NERButton } from '../../../components/NERButton';
import { useGetAllManufacturers } from '../../../hooks/bom.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import AdminToolTable from '../AdminToolTable';
import CreateManufacturerModal from './CreateManufacturerFormModal';
import ManufacturerDeleteButton from './ManufacturerDeleteModal';

const ManufacturerTable: React.FC = () => {
  const {
    data: manufactureres,
    isLoading: manufactureresIsLoading,
    isError: manufacturersIsError,
    error: manufacturersError
  } = useGetAllManufacturers();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [manufacturerList, setManufacturerList] = useState<Manufacturer[]>([]);

  useEffect(() => {
    if (manufactureres) {
      setManufacturerList(manufactureres);
    }
  }, [manufactureres]);

  if (!manufactureres || manufactureresIsLoading) {
    return <LoadingIndicator />;
  }
  if (manufacturersIsError) {
    return <ErrorPage message={manufacturersError?.message} />;
  }

  const handleDeleteManufacturer = async (manufacturerName: string) => {
    try {
      deleteManufacturer(manufacturerName);
      const updatedManufacturersTableRows = manufacturerList.filter(
        (manufacturer) => manufacturer.name !== manufacturerName
      );

      setManufacturerList(updatedManufacturersTableRows);
    } catch (error) {
      console.error('Error deleting manufacturer:', error);
    }
  };

  const manufacturersTableRows = manufacturerList.map((manufacturer) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(manufacturer.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>
        <Grid container justifyContent="space-between">
          <Grid sx={{ align: 'left' }}>{manufacturer.name}</Grid>
          <Grid>
            <ManufacturerDeleteButton name={manufacturer.name} onDelete={handleDeleteManufacturer} />
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
