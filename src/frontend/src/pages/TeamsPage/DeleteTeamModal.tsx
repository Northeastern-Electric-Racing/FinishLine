import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useToast } from '../../hooks/toasts.hooks';
import * as yup from 'yup';
import { useDeleteTeam, useSingleTeam } from '../../hooks/teams.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import NERFormModal from '../../components/NERFormModal';
import { Typography, FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';

interface DeleteTeamInputs {
  teamName: string;
}

interface DeleteTeamModalProps {
  teamId: string;
  showModal: boolean;
  onHide: () => void;
}

const DeleteTeamModal: React.FC<DeleteTeamModalProps> = ({ teamId, showModal, onHide }: DeleteTeamModalProps) => {
  const { data: team, isLoading: teamIsLoading, isError: teamIsError, error: teamError } = useSingleTeam(teamId);
  const { isLoading: deleteIsLoading, isError: deleteIsError, error: deleteError, mutateAsync } = useDeleteTeam();
  const toast = useToast();
  const teamNameTester = (teamName: string | undefined) =>
    team !== undefined && teamName !== undefined && teamName.toLowerCase() === team.teamName.toLowerCase();
  const schema = yup.object().shape({
    teamName: yup.string().required().test('team-name-test', 'Team name does not match', teamNameTester)
  });
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      teamName: ''
    },
    mode: 'onChange'
  });
  const history = useHistory();

  const handleConfirm = async ({ teamName }: DeleteTeamInputs) => {
    if (team?.teamName.toLowerCase() === teamName.toLowerCase()) {
      try {
        await mutateAsync(teamId);
        onHide();
        history.goBack();
        toast.success('Team deleted successfully!');
      } catch (e) {
        if (e instanceof Error) {
          toast.error(e.message);
        }
      }
    }
  };

  if (!team || teamIsLoading || deleteIsLoading) return <LoadingIndicator />;
  if (teamIsError) return <ErrorPage message={teamError.message} />;
  if (deleteIsError) return <ErrorPage message={deleteError?.message} />;

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title={`Delete Team ${team.teamName}`}
      reset={() => reset({ teamName: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="delete-team-form"
      submitText="Delete"
      disabled={!isValid}
      showCloseButton
    >
      <Typography sx={{ marginBottom: '1rem' }}>Are you sure you want to delete Team {team.teamName}?</Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
      <FormControl>
        <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
          To confirm deletion, please type in the name of this team.
        </FormLabel>
        <ReactHookTextField
          control={control}
          name="teamName"
          errorMessage={errors.teamName}
          placeholder="Enter Team Name here"
          sx={{ width: 1 }}
          type="string"
        />
      </FormControl>
    </NERFormModal>
  );
};

export default DeleteTeamModal;
