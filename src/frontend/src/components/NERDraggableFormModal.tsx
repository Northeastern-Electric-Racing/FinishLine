import { Box, Typography, useTheme, IconButton } from '@mui/material';
import NERFailButton from './NERFailButton';
import NERSuccessButton from './NERSuccessButton';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import { ReactNode } from 'react';
import { CancelText, SubmitText } from '../utils/teams.utils';

interface NERDraggableFormModalModalProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  cancelText?: CancelText;
  submitText?: SubmitText;
  formId?: string;
  disableSuccessButton?: boolean;
  showCloseButton?: boolean;
  hideFormButtons?: boolean;
  handleSubmit: () => void;
  onHide: () => void;
}

export const NERDraggableFormModal = ({
  open,
  title,
  children,
  cancelText,
  submitText,
  formId,
  disableSuccessButton = false,
  showCloseButton = false,
  hideFormButtons = false,
  handleSubmit,
  onHide
}: NERDraggableFormModalModalProps) => {
  const theme = useTheme();

  return (
    <>
      {open && (
        <Draggable handle=".draggable-handle">
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              right: '5%',
              backgroundColor: theme.palette.background.paper,
              boxShadow: 24,
              zIndex: 6,
              width: '30%',
              borderRadius: '8px'
            }}
          >
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
            <Box className="draggable-handle" sx={{ backgroundColor: '#ef4345', padding: 2, borderRadius: '10px 10px 0 0' }}>
              <Typography sx={{ fontSize: '1.2em' }}>{title}</Typography>
            </Box>
            <Box>{children}</Box>
            {!hideFormButtons && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '15px' }}>
                <NERFailButton onClick={onHide} form={formId}>
                  {cancelText || 'Cancel'}
                </NERFailButton>
                <NERSuccessButton onClick={handleSubmit} form={formId} disabled={disableSuccessButton} sx={{ ml: 2 }}>
                  {submitText || 'Submit'}
                </NERSuccessButton>
              </Box>
            )}
          </Box>
        </Draggable>
      )}
    </>
  );
};
