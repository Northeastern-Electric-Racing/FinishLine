import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import NERFormModal from './NERFormModal';
import { NERModalProps } from './NERModal';

interface NERDeleteModalProps<T extends FieldValues> extends NERModalProps {
  onFormSubmit: (data: T) => void;
  title: string;
}

const NERDeleteModal = ({ open, onHide, title, onFormSubmit }: NERDeleteModalProps<any>) => {
  const { handleSubmit, reset } = useForm({
    mode: 'onChange'
  });

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={`Delete ${title}`}
      onFormSubmit={onFormSubmit}
      handleUseFormSubmit={handleSubmit}
      reset={reset}
      formId="delete-cr-form"
    >
      <Typography sx={{ marginBottom: '1rem' }}>Are you sure you want to delete this {title}?</Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
    </NERFormModal>
  );
};

export default NERDeleteModal;
