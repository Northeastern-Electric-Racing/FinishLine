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
  hideFormButtons?: boolean;
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
  showCloseButton = false,
  hideFormButtons = false
}: NERModalProps) => {
  return (
    <Dialog open={open} onClose={onHide} PaperProps={{ style: { borderRadius: '10px', minWidth: '600px' } }}>
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
      <DialogContent
        sx={{
          '&.MuiDialogContent-root': { paddingTop: '20px' },
          '&::-webkit-scrollbar': {
            height: '0.55rem' // Adjust the the thickness of the scrollbar
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#EF4345', //FinishLine 'red' color
            borderRadius: '50px' //make the scrollbar rounded
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#b0191a' // Change to a darker shade of red on hover
          }
        }}
      >
        {children}
      </DialogContent>
      {!hideFormButtons && (
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
      )}
    </Dialog>
  );
};

export default NERModal;
