import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import { EventType } from 'shared';

interface DeleteEventTypeModalProps {
  open: boolean;
  onHide: () => void;
  eventType: EventType | undefined;
  onFormSubmit: () => void;
}

const DeleteEventTypeModal: React.FC<DeleteEventTypeModalProps> = ({
  open,
  onHide,
  eventType,
  onFormSubmit
}: DeleteEventTypeModalProps) => {
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
      formId="delete-event-type-form"
      title="Delete Event Type"
      submitText="Delete"
    >
      <Typography sx={{ marginBottom: '1rem' }}>
        Are you sure you want to delete event type "{eventType?.name || ''}"?
      </Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
    </NERFormModal>
  );
};

export default DeleteEventTypeModal;

