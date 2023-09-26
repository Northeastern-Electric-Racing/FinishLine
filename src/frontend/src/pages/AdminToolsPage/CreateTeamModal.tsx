import { Controller, useForm } from 'react-hook-form';
import { useToast } from '../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateTeamPayload, useCreateTeam } from '../../hooks/teams.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import NERFormModal from '../../components/NERFormModal';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';
import { useAllUsers } from '../../hooks/users.hooks';
import { isHead } from 'shared';
import NERAutocomplete from '../../components/NERAutocomplete';
import { userComparator, userToAutocompleteOption } from '../../utils/teams.utils';

const schema = yup.object().shape({
  teamName: yup.string().required('Team Name is Required'),
  headId: yup.string().required('You must set a Head'),
  slackId: yup.string().required('Team Channel SlackId is required'),
  description: yup.string().required('Description is Required')
});

interface CreateTeamModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateTeamModal = ({ showModal, handleClose }: CreateTeamModalProps) => {
  const { isLoading, mutateAsync } = useCreateTeam();
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();
  const toast = useToast();

  const defaultValues = {
    teamName: '',
    slackId: '',
    description: '',
    headId: ''
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (isLoading || allUsersIsLoading || !users) return <LoadingIndicator />;

  const onFormSubmit = async (data: CreateTeamPayload) => {
    try {
      await mutateAsync({ ...data, headId: Number(data.headId) });
      reset(defaultValues);
      handleClose();
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
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={'Create Team'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={'create-team-form'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Team Name</FormLabel>
        <ReactHookTextField name="teamName" control={control} fullWidth errorMessage={errors.teamName} />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Head</FormLabel>
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
        <FormLabel>Slack Channel ID</FormLabel>
        <ReactHookTextField name="slackId" control={control} fullWidth errorMessage={errors.slackId} />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Description</FormLabel>
        <ReactHookTextField
          name="description"
          control={control}
          fullWidth
          multiline
          rows={5}
          errorMessage={errors.description}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default CreateTeamModal;
