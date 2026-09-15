import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { MilestonePayload, useCreateMilestone } from '../../../hooks/recruitment.hooks';
import MilestoneFormModal from './MilestoneFormModal';

interface CreateMilestoneFormModalProps {
  open: boolean;
  handleClose: () => void;
  createDefaults: { isOnNewMemberDashboard: boolean; isOnRecruitingDashboard: boolean };
}

const CreateMilestoneFormModal = ({ open, handleClose, createDefaults }: CreateMilestoneFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateMilestone();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = (data: MilestonePayload) => mutateAsync({ ...data, ...createDefaults });

  return <MilestoneFormModal open={open} handleClose={handleClose} onSubmit={onSubmit} />;
};

export default CreateMilestoneFormModal;
