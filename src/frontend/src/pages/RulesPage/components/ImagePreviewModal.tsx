/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface ImagePreviewModalProps {
  open: boolean;
  imageUrl: string;
  title: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ open, imageUrl, title, onClose }) => {
  return (
    <NERModal open={open} onHide={onClose} title={title} showCloseButton hideFormButtons>
      <Box
        component="img"
        src={imageUrl}
        alt="Rule attachment"
        sx={{ maxWidth: '100%', maxHeight: '75vh', display: 'block', mx: 'auto' }}
      />
    </NERModal>
  );
};

export default ImagePreviewModal;
