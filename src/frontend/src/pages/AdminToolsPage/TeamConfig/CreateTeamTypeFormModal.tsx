import TeamTypeFormModal from './TeamTypeFormModal';
import { useCreateTeamType } from '../../../hooks/design-reviews.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';

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
