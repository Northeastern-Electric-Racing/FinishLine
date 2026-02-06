import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box
} from '@mui/material';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';

const headerBackground = '#ef4345';

export interface DeleteSeriesConfirmationModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (deleteEntireEvent: boolean) => void;
  eventTitle: string;
  totalSlots: number;
}

const DeleteSeriesConfirmationModal: React.FC<DeleteSeriesConfirmationModalProps> = ({
  open,
  onCancel,
  onConfirm,
  eventTitle,
  totalSlots
}) => {
  const [deleteEntireEvent, setDeleteEntireEvent] = useState(false);

  const handleConfirm = () => {
    onConfirm(deleteEntireEvent);
    setDeleteEntireEvent(false);
  };

  const handleCancel = () => {
    onCancel();
    setDeleteEntireEvent(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        style: { borderRadius: '10px', maxWidth: '550px' }
      }}
    >
      <DialogTitle sx={{ backgroundColor: headerBackground, minHeight: '64px' }}>Delete Event</DialogTitle>
      <DialogContent sx={{ paddingTop: '20px !important' }}>
        <Typography sx={{ mb: 2 }}>
          This event "{eventTitle}" has {totalSlots} scheduled occurrences. Would you like to delete just this occurrence or
          all occurrences?
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={deleteEntireEvent} onChange={(e) => setDeleteEntireEvent(e.target.value === 'true')}>
            <FormControlLabel
              value={false}
              control={<Radio sx={{ '&.Mui-checked': { color: '#ef4345' } }} />}
              label="This occurrence only"
            />
            <FormControlLabel
              value={true}
              control={<Radio sx={{ '&.Mui-checked': { color: '#ef4345' } }} />}
              label={`All occurrences (${totalSlots} total)`}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
          <NERFailButton sx={{ mx: 1 }} onClick={handleCancel}>
            Cancel
          </NERFailButton>
          <NERSuccessButton sx={{ mx: 1 }} onClick={handleConfirm}>
            Confirm
          </NERSuccessButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSeriesConfirmationModal;
