import { ReactNode } from 'react';
import { FieldValues, UseFormReset, useForm, SubmitHandler } from 'react-hook-form';
import NERModal, { NERModalProps } from './NERModal';
import NERFormModal from './NERFormModal';
import { Typography } from '@mui/material';
import schema from 'yup/lib/schema';

interface NERDeleteModalProps<T extends FieldValues> extends NERModalProps {
  reset: UseFormReset<T>;
  onFormSubmit: (data: T) => void;
  deleteHook: () => Promise<void>;
  children?: ReactNode;
  title: string;
  item: any;
}

const NERDeleteModal = ({
  open,
  onHide,
  title,
  reset,
  onFormSubmit,
  deleteHook,
  disabled,
}: NERDeleteModalProps<any>) => {
  // Initialize useForm
  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange'
  });

  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper: SubmitHandler<any> = async (data: any) => {
    await deleteHook();

    await onFormSubmit(data);
  };

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={`Delete ${title}`}
      reset={reset}
      onFormSubmit={onSubmitWrapper}
      handleUseFormSubmit={handleSubmit}
      formId="delete-cr-form"
      disabled={disabled}
      showCloseButton
    >
      <Typography sx={{ marginBottom: '1rem' }}>
        Are you sure you want to delete {title}?
      </Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
    </NERFormModal>
  );
};

export default NERDeleteModal;
