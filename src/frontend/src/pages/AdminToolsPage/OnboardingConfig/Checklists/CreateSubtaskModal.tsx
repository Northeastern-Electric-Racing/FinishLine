import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { ChecklistCreateArgs, useCreateChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import SubtaskFormModal from './SubtaskFormModal';
import { Checklist } from 'shared';

interface CreateSubtaskModalProps {
  open: boolean;
  handleClose: () => void;
  parentChecklist: Checklist;
}

const CreateSubtaskModal = ({ open, handleClose, parentChecklist }: CreateSubtaskModalProps) => {
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

  return (
    <SubtaskFormModal open={open} handleClose={handleClose} onSubmit={handleFormSubmit} parentChecklist={parentChecklist} />
  );
};

export default CreateSubtaskModal;
