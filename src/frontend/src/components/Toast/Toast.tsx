/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Inspired by https://github.com/ryohey/use-toast-mui

import { Snackbar, Alert } from '@mui/material';
import { FC, SyntheticEvent, useState } from 'react';
import { ToastInputs } from './ToastProvider';

export interface ToastProps {
  toast: ToastInputs;
  onExited: () => void;
}

const Toast: FC<ToastProps> = ({ toast, onExited, ...props }: ToastProps) => {
  const [open, setOpen] = useState(true);
  const onClose = (_event: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      key={toast.key}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      TransitionProps={{ onExited }}
      autoHideDuration={toast.autoHideDuration ?? 3000}
      onClose={onClose}
      {...props}
    >
      <Alert variant="filled" severity={toast.type} onClose={onClose}>
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
