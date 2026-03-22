/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Inspired by https://github.com/ryohey/use-toast-mui

import { useContext } from 'react';
import { AlertColor } from '@mui/material';
import { ToastContext } from '../components/Toast/ToastProvider';

/**
 * Hook to fire a toast.
 * Examples:
 * useToast().info('Hello World');
 * useToast().success('Poggers');
 * useToast().warning('🕱');
 * useToast().error('💥', 3000);
 */
export const useToast = () => {
  const { addToast } = useContext(ToastContext);
  const fire = (message: string, options: { type: AlertColor; autoHideDuration?: number }) => {
    addToast({ message, ...options, key: new Date().getTime() });
  };
  return {
    fire,
    info(message: string, autoHideDuration?: number) {
      fire(message, { type: 'info', autoHideDuration });
    },
    success(message: string, autoHideDuration?: number) {
      fire(message, { type: 'success', autoHideDuration });
    },
    warning(message: string, autoHideDuration?: number) {
      fire(message, { type: 'warning', autoHideDuration });
    },
    error(message: string, autoHideDuration?: number) {
      fire(message, { type: 'error', autoHideDuration });
    }
  };
};
