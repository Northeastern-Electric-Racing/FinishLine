import React from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';
import { Project } from 'shared';
import { projectWbsNamePipe } from '../../../utils/pipes';
import { useAllProjects } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface EditFeatureProjectsDropdownProps {
  onChange: (value: Project[] | null) => void;
  value: Project[] | undefined;
}

const EditFeaturedProjectsDropdown: React.FC<EditFeatureProjectsDropdownProps> = ({ onChange, value }) => {
  const { data: allProjects, isLoading, isError, error } = useAllProjects();

  if (isLoading || !allProjects) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <Autocomplete
      multiple
      options={allProjects}
      getOptionLabel={(option) => `${projectWbsNamePipe(option)}`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => <TextField {...params} variant="outlined" size={'small'} />}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip variant="outlined" label={`${projectWbsNamePipe(option)}`} {...getTagProps({ index })} />
        ))
      }
      placeholder={'Add a Project to Feature'}
    />
  );
};

export default EditFeaturedProjectsDropdown;
