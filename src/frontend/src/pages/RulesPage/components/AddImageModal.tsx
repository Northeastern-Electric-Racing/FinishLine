/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import { useToast } from '../../../hooks/toasts.hooks';

interface AddImageModalProps {
  open: boolean;
  onClose: () => void;
}

const AddImageModal: React.FC<AddImageModalProps> = ({ open, onClose }) => {
  const toast = useToast();

  const handleSubmit = () => {
    toast.success('Image added');
    onClose();
  };

  return (
    <NERModal open={open} onHide={onClose} title="Add Image" onSubmit={handleSubmit} submitText="Submit" showCloseButton>
      <Box sx={{ minWidth: '400px', py: 1 }}>
        <Typography>Image upload coming soon.</Typography>
      </Box>
    </NERModal>
  );
};

export default AddImageModal;
