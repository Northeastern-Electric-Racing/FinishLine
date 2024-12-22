import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ChecklistFormModal from './ChecklistFormModal';
import { ChecklistCreateArgs, useCreateChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';

interface CreateChecklistModalProps {
  open: boolean;
  handleClose: () => void;
  teamId?: string;
  teamTypeId?: string;
}

const CreateChecklistModal = ({ open, handleClose, teamId, teamTypeId }: CreateChecklistModalProps) => {
  const { mutateAsync: createChecklist, isLoading, isError, error } = useCreateChecklist();
  const toast = useToast();

  const handleFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const response = await createChecklist(data);
      return response;
    } catch (err) {
      toast.error('Failed to create checklist');
      throw err;
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <ChecklistFormModal open={open} handleClose={handleClose} onSubmit={handleFormSubmit} teamId={teamId} teamTypeId={teamTypeId} />;
};

export default CreateChecklistModal;
