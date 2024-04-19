import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, TableCell, TableRow } from '@mui/material';
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

  const handleDeleteManufacturer = async (manufacturerName: string) => {
    try {
      await mutateAsync({ manufacturerName: manufacturerName });
      toast.success(`Manufacturer: ${manufacturerName} Deleted Successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
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
          type="button"
          sx={{
            mx: 1
          }}
          onClick={() => setShowDeleteModal(true)}
        >
          <DeleteIcon />
        </IconButton>
        {showDeleteModal && (
          <ManufacturerDeleteModal name={name} onDelete={handleDeleteSubmit} onHide={() => setShowDeleteModal(false)} />
        )}
      </>
    );
  };

  const manufacturersTableRows = manufacturers.map((manufacturer) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(manufacturer.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{manufacturer.name}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        <ManufacturerDeleteButton name={manufacturer.name} onDelete={handleDeleteManufacturer} />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateManufacturerModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <AdminToolTable
        columns={[{ name: 'Date Registered' }, { name: 'Manufacturer Name' }, { name: '', width: '10%' }]}
        rows={manufacturersTableRows}
      />
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
