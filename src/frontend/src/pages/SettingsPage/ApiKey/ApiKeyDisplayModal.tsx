import { Alert, Box, Stack, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import CopyToClipboardButton from '../../../components/CopyToClipboardButton';

interface ApiKeyDisplayModalProps {
  open: boolean;
  onHide: () => void;
  token: string;
  title?: string;
  /** what the key acts as, shown in the usage note below the key */
  actsAs?: string;
}

const ApiKeyDisplayModal: React.FC<ApiKeyDisplayModalProps> = ({
  open,
  onHide,
  token,
  title = 'Your New API Key',
  actsAs = 'you'
}) => {
  return (
    <NERModal open={open} onHide={onHide} title={title} hideFormButtons showCloseButton>
      <Stack spacing={2}>
        <Alert severity="warning">
          This is the only time you'll be able to see this key. Copy it somewhere safe before closing this window.
        </Alert>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 1,
              padding: 1.5,
              flexGrow: 1
            }}
          >
            {token}
          </Typography>
          <CopyToClipboardButton msg={token} />
        </Box>

        <Typography variant="caption" color="text.secondary">
          Send this key in the <strong>x-api-key</strong> header. It acts as {actsAs}, so treat it like a password and don't
          commit it anywhere.
        </Typography>
      </Stack>
    </NERModal>
  );
};

export default ApiKeyDisplayModal;
