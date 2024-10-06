import React from 'react';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, TextField } from '@mui/material';

const schema = yup.object().shape({
  description: yup.string()
});

export interface EditDescriptionInput {
  description: string;
}

interface EditDescriptionFormModalProps {
  originalDescription: string;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: EditDescriptionInput) => Promise<void>;
  onReset?: () => void;
}

const EditDescriptionFormModal: React.FC<EditDescriptionFormModalProps> = ({
  modalShow,
  onHide,
  onSubmit,
  originalDescription,
  onReset
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: originalDescription ?? ''
    }
  });

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title="Edit Description"
      formId="edit-organization-description"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      submitText="Save"
      reset={() => {
        if (onReset) onReset();
        reset();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
          reset();
        }}
        onKeyPress={(e) => {
          e.key === 'Enter' && e.preventDefault();
        }}
      >
        <FormControl sx={{ width: '100%' }}>
          <FormLabel>Title</FormLabel>
          <Controller
            name={'description'}
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextField
                required
                onChange={onChange}
                value={value}
                rows={5}
                multiline
                error={!!errors.description}
                sx={{
                  width: '50vh'
                }}
              />
            )}
          />
        </FormControl>
      </form>
    </NERFormModal>
  );
};

export default EditDescriptionFormModal;
