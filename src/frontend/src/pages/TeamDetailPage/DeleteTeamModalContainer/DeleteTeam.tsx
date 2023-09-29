import { useHistory } from 'react-router-dom';
import { useToast } from '../../../hooks/toasts.hooks';
import { useDeleteTeam } from '../../../hooks/teams.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import DeleteTeamView from './DeleteTeamView';

interface DeleteTeamProps {
  teamId: string;
  showModal: boolean;
  handleClose: () => void;
}

export interface DeleteTeamInputs {
  teamId: string;
}

const DeleteTeam: React.FC<DeleteTeamProps> = ({ teamId, showModal, handleClose }: DeleteTeamProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteTeam();

  const handleConfirm = async ({ teamId }: DeleteTeamInputs) => {
    try {
      await mutateAsync(teamId);
      handleClose();
      history.goBack();
      toast.success('Team deleted successfully!');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return <DeleteTeamView teamId={teamId} showModal={showModal} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default DeleteTeam;
