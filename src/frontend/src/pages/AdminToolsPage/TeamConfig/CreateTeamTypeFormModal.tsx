import TeamTypeFormModal from './TeamTypeFormModal';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateTeamType } from '../../../hooks/team-types.hooks';

interface CreateTeamTypeFormModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateTeamTypeFormModal = ({ open, handleClose }: CreateTeamTypeFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateTeamType();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <TeamTypeFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateTeamTypeFormModal;
