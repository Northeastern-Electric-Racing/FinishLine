import { Alert, Stack, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface RegenerateApiKeyModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: () => void;
  /** the last few characters of the existing key, if known */
  preview?: string;
  disabled?: boolean;
  title?: string;
}

const RegenerateApiKeyModal: React.FC<RegenerateApiKeyModalProps> = ({
  open,
  onHide,
  onConfirm,
  preview,
  disabled,
  title = 'Regenerate API Key'
}) => {
  return (
    <NERModal open={open} onHide={onHide} onSubmit={onConfirm} title={title} submitText="Regenerate" disabled={disabled}>
      <Stack spacing={2}>
        <Alert severity="warning">This cannot be undone.</Alert>
        <Typography>
          The existing key
          {preview && (
            <>
              {' '}
              ending in <strong>{preview}</strong>
            </>
          )}{' '}
          will stop working immediately. Anything already using it will need to be updated with the new key.
        </Typography>
      </Stack>
    </NERModal>
  );
};

export default RegenerateApiKeyModal;
