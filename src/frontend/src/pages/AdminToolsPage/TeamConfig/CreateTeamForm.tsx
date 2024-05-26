import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useCreateTeam } from '../../../hooks/teams.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import * as yup from 'yup';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { countWords, isHead, isUnderWordCount } from 'shared';
import { userComparator, userToAutocompleteOption } from '../../../utils/teams.utils';
import { Button, FormControl, FormLabel, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { Box, useTheme } from '@mui/system';
import ReactMarkdown from 'react-markdown';
import { NERButton } from '../../../components/NERButton';

const schema = yup.object().shape({
  teamName: yup.string().required('Team Name is Required'),
  headId: yup.string().required('You must set a Head'),
  slackId: yup.string().required('Team Channel SlackId is required'),
  description: yup.string().required('Description is Required')
});

interface CreateTeamFormInput {
  teamName: string;
  headId: string;
  slackId: string;
  description: string;
  isFinanceTeam: boolean;
}

const defaultValues = {
  teamName: '',
  slackId: '',
  description: '',
  headId: '',
  isFinanceTeam: false
};

const CreateTeamForm = () => {
  const theme = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const { isLoading, mutateAsync } = useCreateTeam();
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();
  const toast = useToast();
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });

  if (!users || allUsersIsLoading || isLoading) return <LoadingIndicator />;

  if (allUsersIsError) return <ErrorPage message={allUsersError.message} />;
  const onFormSubmit = async (data: CreateTeamFormInput) => {
    try {
      await mutateAsync({ ...data });
      reset(defaultValues);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, 5000);
      }
    }
  };

  const headOptions = users
    .filter((user) => isHead(user.role))
    .sort(userComparator)
    .map(userToAutocompleteOption);

  return (
    <form
      id={'create-team-form'}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onFormSubmit)(e);
      }}
      noValidate
    >
      <FormControl sx={{ width: '50%', marginRight: '10px' }}>
        <FormLabel sx={{ marginTop: '6px' }}>Team Name</FormLabel>
        <ReactHookTextField name="teamName" control={control} fullWidth errorMessage={errors.teamName} />
      </FormControl>
      <FormControl sx={{ width: '45%' }}>
        <FormLabel sx={{ marginTop: '6px' }}>Slack Channel ID</FormLabel>
        <ReactHookTextField name="slackId" control={control} fullWidth errorMessage={errors.slackId} />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel sx={{ marginTop: '6px' }}>Head</FormLabel>
        <Controller
          name="headId"
          control={control}
          render={({ field: { onChange, value } }) => (
            <NERAutocomplete
              value={headOptions.find((option) => option.id === value) || { id: '', label: '' }}
              onChange={(_event, newValue) => onChange(newValue ? newValue.id : '')}
              options={headOptions}
              id="create-team-head"
              size="small"
              placeholder="Choose a user"
              errorMessage={errors.headId}
            />
          )}
        />
      </FormControl>
      <FormControl fullWidth>
        <Controller
          name="description"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Box>
              <Box
                sx={{
                  marginTop: '6px',
                  marginBottom: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'end'
                }}
              >
                <FormLabel>Description</FormLabel>
                <Button
                  onClick={() => {
                    setShowPreview(!showPreview);
                  }}
                  sx={{
                    backgroundColor: theme.palette.grey[600],
                    color: theme.palette.getContrastText(theme.palette.grey[600]),
                    '&:hover': {
                      backgroundColor: theme.palette.grey[700]
                    }
                  }}
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
              </Box>
              {showPreview ? (
                <ReactMarkdown>{field.value}</ReactMarkdown>
              ) : (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={5}
                  id={'description-input'}
                  inputProps={{
                    maxLength: isUnderWordCount(field.value, 300) ? null : 0
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  error={!!errors.description || !isUnderWordCount(field.value, 300)}
                  helperText={errors.description ? errors.description.message : `${countWords(field.value)}/300 words`}
                />
              )}
            </Box>
          )}
        />
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <FormControl>
          <FormLabel>Finance Team</FormLabel>
          <Controller
            name="isFinanceTeam"
            control={control}
            render={({ field }) => (
              <NERButton variant={field.value ? 'contained' : 'outlined'} onClick={() => field.onChange(!field.value)}>
                {field.value ? 'Yes' : 'No'}
              </NERButton>
            )}
          />
        </FormControl>
        <NERButton variant="contained" type="submit">
          Create Team
        </NERButton>
      </Box>
    </form>
  );
};

export default CreateTeamForm;
