import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Grid, IconButton, TableCell, TableRow } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { NERButton } from '../../../components/NERButton';
import { useDeleteManufacturer, useGetAllManufacturers } from '../../../hooks/bom.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import AdminToolTable from '../AdminToolTable';
import CreateManufacturerModal from './CreateManufacturerFormModal';
import ManufacturerDeleteModal from './ManufacturerDeleteModal';
import { useState } from 'react';

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
  const { mutateAsync } = useDeleteManufacturer();
  const toast = useToast();

  if (!manufacturers || manufacturersIsLoading) {
    return <LoadingIndicator />;
  }
  if (manufacturersIsError) {
    return <ErrorPage message={manufacturersError?.message} />;
  }

  const handleDeleteManufacturer = (manufacturerName: string) => {
    try {
      mutateAsync({ manufacturerName: manufacturerName });
      toast.success(`Manufacturer: ${manufacturerName} Deleted Successfully!`);
    } catch (error) {
      toast.error(`Error Deleting Manufacturer!`);
    }
  };

  const ManufacturerDeleteButton: React.FC<ManufacturerDeleteButtonProps> = ({ name, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteSubmit = () => {
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

  const manufacturersTableRows = manufacturers.map((manufacturers) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(manufacturers.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>
        <Grid container justifyContent="space-between">
          <Grid sx={{ align: 'left' }}>{manufacturers.name}</Grid>
          <Grid>
            <ManufacturerDeleteButton name={manufacturers.name} onDelete={handleDeleteManufacturer} />
          </Grid>
        </Grid>
      </TableCell>
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
