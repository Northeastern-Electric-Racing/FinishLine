import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Grid, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Manufacturer } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { NERButton } from '../../../components/NERButton';
import { useDeleteManufacturer, useGetAllManufacturers } from '../../../hooks/bom.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import AdminToolTable from '../AdminToolTable';
import CreateManufacturerModal from './CreateManufacturerFormModal';
import ManufacturerDeleteModal from './ManufacturerDeleteModal';

interface ManufacturerDeleteButtonProps {
  name: string;
  onDelete: (name: string) => void;
}

const ManufacturerTable: React.FC = () => {
  const {
    data: manufacturers,
    isLoading: manufacturersIsLoading,
    isError: manufacturersIsError,
    error: manufacturersError
  } = useGetAllManufacturers();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [manufacturerList, setManufacturerList] = useState<Manufacturer[]>([]);
  const { isLoading, isError, error, mutateAsync } = useDeleteManufacturer();
  const toast = useToast();

  useEffect(() => {
    if (manufacturers) {
      setManufacturerList(manufacturers);
    }
  }, [manufacturers]);

  if (!manufacturers || manufacturersIsLoading) {
    return <LoadingIndicator />;
  }
  if (manufacturersIsError) {
    return <ErrorPage message={manufacturersError?.message} />;
  }

  const handleDeleteManufacturer = async (manufacturerName: string) => {
    try {
      mutateAsync({ manufacturerName: manufacturerName });
      const updatedManufacturersTableRows = manufacturerList.filter(
        (manufacturer) => manufacturer.name !== manufacturerName
      );
      toast.success(`Manufacturer: ${manufacturerName} Deleted Successfully!`);

      setManufacturerList(updatedManufacturersTableRows);
    } catch (error) {
      toast.error(`Error Deleting Manufacturer!`);
    }
  };

  const ManufacturerDeleteButton: React.FC<ManufacturerDeleteButtonProps> = ({ name, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteSubmit = async () => {
      onDelete(name);
      setShowDeleteModal(false);
    };

    return (
      <>
        <IconButton
          onClick={() => setShowDeleteModal(true)}
          sx={{
            color: 'Red',
            width: 'auto',
            height: 'auto',
            padding: 0.1,
            borderRadius: '5px'
          }}
        >
          <Box
            sx={{
              border: '2px solid red',
              borderRadius: '5px',
              width: '24px',
              height: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <DeleteIcon sx={{ fontSize: 'small' }} />
          </Box>
        </IconButton>
        {showDeleteModal && (
          <ManufacturerDeleteModal name={name} onDelete={handleDeleteSubmit} onHide={() => setShowDeleteModal(false)} />
        )}
      </>
    );
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
