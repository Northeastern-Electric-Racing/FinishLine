/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Snackbar, Alert } from '@mui/material';

interface ToastProps {
  message: string;
  autoHideDuration?: number;
  severity: 'error' | 'warning' | 'info' | 'success';
  open: boolean;
  stateSetter: (value: boolean) => void;
}

const Toast: React.FC<ToastProps> = ({ message, autoHideDuration, severity, open, stateSetter }: ToastProps) => {
  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    stateSetter(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      autoHideDuration={autoHideDuration ?? 3000}
      onClose={handleClose}
    >
      <Alert variant="filled" severity={severity} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
