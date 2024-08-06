import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useEditMilestone } from '../../../hooks/recruitment.hooks';
import { Milestone } from 'shared/src/types/milestone-types';
import MilestoneFormModal from './MilestoneFormModal';

interface EditMilestoneFormModalProps {
  open: boolean;
  handleClose: () => void;
  milestone: Milestone;
}

const EditMilestoneFormModal = ({ open, handleClose, milestone }: EditMilestoneFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditMilestone(milestone.milestoneId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <MilestoneFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={milestone} />;
};

export default EditMilestoneFormModal;