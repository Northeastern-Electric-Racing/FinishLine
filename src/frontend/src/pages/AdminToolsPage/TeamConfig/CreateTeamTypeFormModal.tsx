import TeamTypeFormModal from './TeamTypeFormModal';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateTeamType } from '../../../hooks/team-types.hooks';

interface CreateTeamTypeModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateTeamTypeModal = ({ open, handleClose }: CreateTeamTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateTeamType();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <TeamTypeFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateTeamTypeModal;
