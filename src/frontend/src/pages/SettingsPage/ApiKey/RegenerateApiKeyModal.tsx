import { Alert, Stack, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface RegenerateApiKeyModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: () => void;
  preview: string;
}

const RegenerateApiKeyModal: React.FC<RegenerateApiKeyModalProps> = ({ open, onHide, onConfirm, preview }) => {
  return (
    <NERModal open={open} onHide={onHide} onSubmit={onConfirm} title="Regenerate API Key" submitText="Regenerate">
      <Stack spacing={2}>
        <Alert severity="warning">This cannot be undone.</Alert>
        <Typography>
          Your existing key ending in <strong>{preview}</strong> will stop working immediately. Anything already using it
          will need to be updated with the new key.
        </Typography>
      </Stack>
    </NERModal>
  );
};

export default RegenerateApiKeyModal;
