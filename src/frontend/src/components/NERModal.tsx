import { Box, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import NERFailButton from './NERFailButton';
import NERSuccessButton from './NERSuccessButton';
import { UseFormHandleSubmit, UseFormReset } from 'react-hook-form/dist/types';
import { ReactNode } from 'react';

const background = '#ef4345';

interface NERModalProps {
  open: boolean;
  formId: string;
  title: string;
  reset: UseFormReset<any>;
  handleUseFormSubmit: UseFormHandleSubmit<any, undefined>;
  onFormSubmit: (data: any) => void;
  onHide: () => void;
  children?: ReactNode;
}

const NERModal = ({ open, onHide, formId, title, reset, handleUseFormSubmit, onFormSubmit, children }: NERModalProps) => {
  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: any) => {
    await onFormSubmit(data);
    reset({ confirmDone: false });
  };

  return (
    <Dialog open={open} onClose={onHide} PaperProps={{ style: { borderRadius: '10px' } }}>
      <DialogTitle sx={{ backgroundColor: background }}>{title}</DialogTitle>
      <DialogContent sx={{ '&.MuiDialogContent-root': { paddingTop: '20px' } }}>
        <form id={formId} onSubmit={handleUseFormSubmit(onSubmitWrapper)}>
          {children}
        </form>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <NERFailButton sx={{ mx: 1, mb: 1 }} form={formId} onClick={onHide}>
            Cancel
          </NERFailButton>
          <NERSuccessButton sx={{ mx: 1, mb: 1 }} type="submit" form={formId}>
            Submit
          </NERSuccessButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NERModal;
