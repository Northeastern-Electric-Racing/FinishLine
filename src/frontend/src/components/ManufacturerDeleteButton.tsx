import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton } from '@mui/material';
import { useState } from 'react';
import ManufacturerDeleteButtonBlocker from '../components/ManufacturerDeleteButtonBlocker';
import { useToast } from '../hooks/toasts.hooks';
import { useDeleteManufacturer } from '../hooks/bom.hooks';

interface ManufacturerDeleteButtonProps {
  name: string;
  onDelete: (name: string) => void;
}

const ManufacturerDeleteButton: React.FC<ManufacturerDeleteButtonProps> = ({
  name,
  onDelete
}: ManufacturerDeleteButtonProps) => {
  const toast = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutateAsync: deleteManufacturerMutateAsync, isLoading } = useDeleteManufacturer();

  const handleDeleteButtonClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleDeleteSubmit = async () => {
    deleteManufacturer(name);
    setShowDeleteDialog(false);
  };

  const deleteManufacturer = (name: string) => async () => {
    try {
      await deleteManufacturerMutateAsync({ manufacturerName: name }).finally(() =>
        toast.success('Manufacturer Successfully Deleted!')
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  return (
    <>
      <IconButton
        onClick={handleDeleteButtonClick}
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
      {showDeleteDialog && (
        <ManufacturerDeleteButtonBlocker name={name} onHide={handleDeleteCancel} onSubmit={handleDeleteSubmit} />
      )}
    </>
  );
};

export default ManufacturerDeleteButton;
