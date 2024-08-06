import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateMilestone } from '../../../hooks/recruitment.hooks';
import MilestoneFormModal from './MilestoneFormModal';

interface CreateMilestoneFormModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateMilestoneFormModal = ({ open, handleClose }: CreateMilestoneFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateMilestone();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <MilestoneFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateMilestoneFormModal;
