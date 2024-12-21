import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ChecklistFormModal from './ChecklistFormModal';
import { ChecklistCreateArgs, useCreateChecklist } from '../../../../hooks/onboarding.hook';

interface CreateChecklistModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateChecklistModal = ({ open, handleClose }: CreateChecklistModalProps) => {
  const { mutateAsync: createChecklist, isLoading, isError, error } = useCreateChecklist();

  const handleFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const response = await createChecklist(data);
      return response;
    } catch (err) {
      console.error('Error creating checklist:', err);
      throw err; 
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <ChecklistFormModal open={open} handleClose={handleClose} onSubmit={handleFormSubmit} />;
};

export default CreateChecklistModal;
