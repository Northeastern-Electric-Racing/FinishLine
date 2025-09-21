import { useForm, Controller } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Autocomplete, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { wbsPipe } from 'shared';
import { useAllProjectsPreviews, useSetProjectAbbreviation } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const schema = yup.object().shape({
  wbsNum: yup.string().required('Project is Required'),
  abbreviation: yup.string().required('Abbreviation is Required')
});

interface SetAbbreviation {
  open: boolean;
  handleClose: () => void;
}

const SetAbbreviationModal: React.FC<SetAbbreviation> = ({ open, handleClose }) => {
  const {
    data: projects,
    isLoading: projectsIsLoading,
    isError: projectsIsError,
    error: projectsError
  } = useAllProjectsPreviews();
  const { mutateAsync } = useSetProjectAbbreviation();

  const onFormSubmit = async (data: { wbsNum: string; abbreviation: string }) => {
    handleClose();
    await mutateAsync(data);
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      wbsNum: '',
      abbreviation: ''
    }
  });

  const handleCancel = () => {
    reset({ wbsNum: '', abbreviation: '' });
    handleClose();
  };

  if (!projects || projectsIsLoading) {
    return <LoadingIndicator />;
  }
  if (projectsIsError) {
    return <ErrorPage message={projectsError?.message} />;
  }

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title={`Set Project Abbreviation`}
      reset={() => reset({ wbsNum: '', abbreviation: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="set project abbreviation"
      showCloseButton
    >
      <FormControl fullWidth required>
        <FormLabel>Project</FormLabel>
        <Controller
          name="wbsNum"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={projects}
              getOptionLabel={(option) => {
                return option.name;
              }}
              value={field.value ? projects.find((project) => wbsPipe(project.wbsNum) === field.value) || null : null}
              onChange={(_, newValue) => {
                if (newValue) {
                  setValue('wbsNum', wbsPipe(newValue.wbsNum));
                  setValue('abbreviation', newValue.abbreviation ?? '');
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select a project"
                  error={!!errors.wbsNum}
                  helperText={errors.wbsNum?.message}
                />
              )}
            />
          )}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Abbreviation</FormLabel>
        <ReactHookTextField name="abbreviation" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.abbreviation?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default SetAbbreviationModal;
