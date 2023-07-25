import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import NERFailButton from './NERFailButton';
import NERSuccessButton from './NERSuccessButton';
import { ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const background = '#ef4345';

export interface NERModalProps {
  open: boolean;
  formId?: string;
  title: string;
  onSubmit?: () => void;
  onHide: () => void;
  children?: ReactNode;
  cancelText?: string;
  submitText?: string;
  disabled?: boolean;
  showCloseButton?: boolean;
}

const NERModal = ({
  open,
  onHide,
  formId,
  title,
  onSubmit,
  children,
  cancelText,
  submitText,
  disabled = false,
  showCloseButton = false
}: NERModalProps) => {
  return (
    <Dialog open={open} onClose={onHide} PaperProps={{ style: { borderRadius: '10px' } }}>
      <DialogTitle sx={{ backgroundColor: background }}>{title}</DialogTitle>
      {showCloseButton && (
        <IconButton
          aria-label="close"
          onClick={onHide}
          sx={{
            position: 'absolute',
            right: 16,
            top: 12,
            color: (theme) => theme.palette.text.primary
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <DialogContent sx={{ '&.MuiDialogContent-root': { paddingTop: '20px' } }}>{children}</DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
          <NERFailButton sx={{ mx: 1 }} form={formId} onClick={onHide}>
            {cancelText || 'Cancel'}
          </NERFailButton>
          <NERSuccessButton sx={{ mx: 1 }} type="submit" form={formId} onClick={onSubmit} disabled={disabled}>
            {submitText || 'Submit'}
          </NERSuccessButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NERModal;
