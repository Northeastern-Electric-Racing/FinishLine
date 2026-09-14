/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface RemoveImageModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: () => void;
  ruleCode: string;
  imageNumber: number;
}

const RemoveImageModal = ({ open, onHide, onConfirm, ruleCode, imageNumber }: RemoveImageModalProps) => {
  return (
    <NERModal
      open={open}
      onHide={onHide}
      title="Confirm Removal"
      cancelText="Cancel"
      submitText="Save"
      onSubmit={onConfirm}
      formId="remove-image-form"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ fontWeight: 400, fontSize: '1rem' }}>
          Remove Image {imageNumber} from {ruleCode}
        </Typography>
      </Box>
    </NERModal>
  );
};

export default RemoveImageModal;
