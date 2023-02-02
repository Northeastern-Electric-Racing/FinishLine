/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Inspired by https://github.com/ryohey/use-toast-mui

import { createContext, FC, ReactNode, useState } from 'react';
import Toast from './Toast';
import { AlertColor } from '@mui/material';

export interface ToastInputs {
  key: number;
  message: string;
  type: AlertColor;
  autoHideDuration?: number;
}

export const ToastContext = createContext<{
  addToast: (toast: ToastInputs) => void;
}>(null as never);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children, ...props }) => {
  const [toasts, setToasts] = useState<ToastInputs[]>([]);
  const removeToast = (key: number) => setToasts((toastList) => toastList.filter((t) => t.key !== key));
  return (
    <ToastContext.Provider
      value={{
        addToast(toast) {
          setToasts((toastList) => [...toastList, toast]);
        }
      }}
    >
      {children}
      {toasts.map((t) => (
        <Toast toast={t} key={t.key} onExited={() => removeToast(t.key)} {...props} />
      ))}
    </ToastContext.Provider>
  );
};
