import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';
import { NERModalProps } from '../../../components/NERModal';

interface ConfirmOnboardingChecklistModalProps<T extends FieldValues> extends Omit<NERModalProps, 'title'> {
  onFormSubmit: (data: T) => void;
}

const ConfirmOnboardingChecklistModal = ({ open, onHide, onFormSubmit }: ConfirmOnboardingCHecklistModalProps<any>) => {
  const { handleSubmit, reset } = useForm({
    mode: 'onChange'
  });

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      onFormSubmit={onFormSubmit}
      handleUseFormSubmit={handleSubmit}
      reset={reset}
      formId="delete-cr-form"
      title={dataType}
    >
      <Typography sx={{ marginBottom: '1rem' }}>Looks like you completed everything on the onboarding checklist! {dataType}?</Typography>
      <Typography sx={{ fontWeight: 'bold' }}>You sure you want to submit?</Typography>
    </NERFormModal>
  );
};

export default ConfirmOnboardingChecklistModal;
