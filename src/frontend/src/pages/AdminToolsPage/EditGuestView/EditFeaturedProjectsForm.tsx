import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import EditFeaturedProjectsDropdown from './EditFeaturedProjectsDropdown';
import { Box, FormControl } from '@mui/material';
import { Project } from 'shared';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';

const schema = yup.object().shape({
  description: yup.array().of(yup.string())
});

export interface EditFeaturedProjectsFormInput {
  featuredProjects: Project[];
}

interface EditFeaturedProjectsFormProps {
  featuredProjects: Project[];
  onSubmit: (formInput: EditFeaturedProjectsFormInput) => Promise<void>;
  onHide: () => void;
  isEditMode: boolean;
}

const EditFeaturedProjectsForm: React.FC<EditFeaturedProjectsFormProps> = ({
  featuredProjects,
  onSubmit,
  onHide,
  isEditMode
}) => {
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      featuredProjects: featuredProjects ?? []
    }
  });

  const onSubmitWrapper = async (data: EditFeaturedProjectsFormInput) => {
    await onSubmit(data);
    reset();
  };

  const onHideWrapper = () => {
    onHide();
    reset();
  };

  return (
    <form
      id="edit-organization-featured-projects"
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
          name={'featuredProjects'}
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => <EditFeaturedProjectsDropdown onChange={onChange} value={value} />}
        />
      </FormControl>
      {isEditMode && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
            mt: 2
          }}
        >
          <NERFailButton sx={{ mx: 1 }} form={'edit-organization-featured-projects'} onClick={onHideWrapper}>
            Cancel
          </NERFailButton>
          <NERSuccessButton
            sx={{ mx: 1 }}
            type="submit"
            form={'edit-organization-featured-projects'}
            onClick={handleSubmit(onSubmitWrapper)}
          >
            Save
          </NERSuccessButton>
        </Box>
      )}
    </form>
  );
};

export default EditFeaturedProjectsForm;
