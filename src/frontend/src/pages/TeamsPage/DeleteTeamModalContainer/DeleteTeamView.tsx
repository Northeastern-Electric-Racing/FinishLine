import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSingleTeam } from '../../../hooks/teams.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import * as yup from 'yup';
import { DeleteTeamInputs } from './DeleteTeam';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import ReactHookTextField from '../../../components/ReactHookTextField';

interface DeleteTeamViewProps {
  teamId: string;
  showModal: boolean;
  onHide: () => void;
  onSubmit: (data: DeleteTeamInputs) => Promise<void>;
}

const DeleteTeamView: React.FC<DeleteTeamViewProps> = ({ teamId, showModal, onHide, onSubmit }: DeleteTeamViewProps) => {
  const { isLoading, isError, data: team, error } = useSingleTeam(teamId);

  const teamNameTester = (teamName: string | undefined) =>
    team !== undefined && teamName !== undefined && teamName.toLowerCase() === team.teamName.toLowerCase();

  const schema = yup.object().shape({
    teamName: yup.string().required().test('team-name-test', 'Team name does not match', teamNameTester)
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      teamName: ''
    },
    mode: 'onChange'
  });

  if (isLoading || !team) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const onSubmitWrapper = async (data: DeleteTeamInputs) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={showModal} onClose={onHide}>
      <DialogTitle
        className="font-weight-bold"
        sx={{
          '&.MuiDialogTitle-root': {
            padding: '1rem 1.5rem 0'
          }
        }}
      >{`Delete Team ${team.teamName}`}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onHide}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          '&.MuiDialogContent-root': {
            padding: '1rem 1.5rem'
          }
        }}
      >
        <Typography sx={{ marginBottom: '1rem' }}>Are you sure you want to delete Team {team.teamName}?</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
        <form
          id="delete-team-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmitWrapper)(e);
          }}
        >
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
        </form>
      </DialogContent>
      <DialogActions>
        <NERSuccessButton variant="contained" sx={{ mx: 1 }} onClick={onHide}>
          Cancel
        </NERSuccessButton>
        <NERFailButton variant="contained" type="submit" form="delete-team-form" sx={{ mx: 1 }} disabled={!isValid}>
          Delete
        </NERFailButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTeamView;
