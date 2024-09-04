import React from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import NERFormModal from './NERFormModal';
import { NERModalProps } from './NERModal';

interface NERDeleteModalProps<T extends FieldValues> extends NERModalProps {
  onFormSubmit: (data: T) => void;
  children?: React.ReactNode;
  title: string;
}

const NERDeleteModal = ({ open, onHide, title, onFormSubmit }: NERDeleteModalProps<any>) => {
  const { handleSubmit, reset } = useForm({
    mode: 'onChange'
  });

  const onSubmitWrapper: SubmitHandler<any> = async (data: any) => {
    await onFormSubmit(data);
  };

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={`Delete ${title}`}
      onFormSubmit={onSubmitWrapper}
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
