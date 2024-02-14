import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton } from '@mui/material';
import { useState } from 'react';
import ManufacturerDeleteButtonBlocker from '../components/ManufacturerDeleteButtonBlocker';

interface ManufacturerDeleteButtonProps {
  name: String;
  onDelete: (name: String) => void;
}

const ManufacturerDeleteButton: React.FC<ManufacturerDeleteButtonProps> = ({
  name,
  onDelete
}: ManufacturerDeleteButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteButtonClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleDeleteSubmit = async () => {
    onDelete(name);
    setShowDeleteDialog(false);
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
