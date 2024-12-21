import React from 'react';
import { Typography, Box } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface ConfirmOnboardingChecklistModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmOnboardingChecklistModal: React.FC<ConfirmOnboardingChecklistModalProps> = ({
  open,
  onHide,
  title = 'Confirm Action'
}) => {
  return (
    <NERModal open={open} onHide={onHide} title={title}>
      <Box
        sx={{
          textAlign: 'center',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography sx={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Looks like you completed everything on the onboarding checklist!
        </Typography>

        <Typography sx={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          You sure you want to submit?
        </Typography>

        <Typography sx={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'darkgray', fontStyle: 'italic' }}>
          (After you submit, you will be officially onboarded into NER!)
        </Typography>
      </Box>
    </NERModal>
  );
};

export default ConfirmOnboardingChecklistModal;
