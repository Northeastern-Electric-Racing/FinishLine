/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Snackbar, Alert } from '@mui/material';

interface ToastProps {
  message: string;
  autoHideDuration?: number; // milliseconds
  type: 'error' | 'warning' | 'info' | 'success';
  open: boolean;
  handleClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, autoHideDuration, type, open, handleClose }: ToastProps) => {
  const onClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    handleClose();
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      autoHideDuration={autoHideDuration ?? 3000}
      onClose={onClose}
    >
      <Alert variant="filled" severity={type} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
