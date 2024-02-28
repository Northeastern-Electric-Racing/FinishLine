import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import NERModal from '../../../components/NERModal';

interface ManufacturerDeleteButtonProps {
  name: string;
  onDelete: (name: string) => void;
}

const ManufacturerDeleteButton: React.FC<ManufacturerDeleteButtonProps> = ({
  name,
  onDelete
}: ManufacturerDeleteButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteSubmit = async () => {
    onDelete(name);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <IconButton
        onClick={() => setShowDeleteDialog(true)}
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
      <NERModal
        open={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        title="Warning!"
        cancelText="Cancel"
        submitText="Delete"
        onSubmit={() => handleDeleteSubmit()}
      >
        <Typography>Are you sure you want to delete this manufacturer: {name}</Typography>
      </NERModal>
    </>
  );
};

export default ManufacturerDeleteButton;
