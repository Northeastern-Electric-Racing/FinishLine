import React from 'react';
import * as yup from 'yup';
import { Controller, set, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, FormControl, FormLabel, TextField, Typography } from '@mui/material';
import { Organization } from 'shared';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';

const schema = yup.object().shape({
  description: yup.string()
});

export interface EditDescriptionInput {
  description: string;
}

interface EditDescriptionFormProps {
  organization: Organization;
  onSubmit: (formInput: EditDescriptionInput) => Promise<void>;
  onHide: () => void;
  isEditMode: boolean;
}

const EditDescriptionForm: React.FC<EditDescriptionFormProps> = ({ organization, onSubmit, onHide, isEditMode }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: organization.description ?? ''
    }
  });

  const onSubmitWrapper = async (data: EditDescriptionInput) => {
    await onSubmit(data);
    reset();
  };

  const onHideWrapper = () => {
    onHide();
    reset();
  };

  return (
    <form
      id="edit-organization-description"
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
        <Controller
          name={'description'}
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextField required onChange={onChange} value={value} rows={5} multiline error={!!errors.description} />
          )}
        />
      </FormControl>
      {isEditMode && (
        <Box
          sx={{
            my: 2,
            display: 'flex',
            justifyContent: 'end'
          }}
        >
          <NERFailButton sx={{ mx: 1 }} form={'edit-organization-description'} onClick={onHideWrapper}>
            Cancel
          </NERFailButton>
          <NERSuccessButton
            sx={{ mx: 1 }}
            type="submit"
            form={'edit-organization-description'}
            onClick={handleSubmit(onSubmitWrapper)}
          >
            Save
          </NERSuccessButton>
        </Box>
      )}
    </form>
  );
};

export default EditDescriptionForm;
