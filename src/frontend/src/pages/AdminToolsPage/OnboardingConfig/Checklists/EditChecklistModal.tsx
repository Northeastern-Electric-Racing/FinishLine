import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ChecklistFormModal from './ChecklistFormModal';
import { ChecklistCreateArgs, useEditChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import { Checklist } from 'shared';

interface EditChecklistModalProps {
  open: boolean;
  handleClose: () => void;
  teamId?: string;
  teamTypeId?: string;
  defaultValues: Checklist;
}

const EditChecklistModal = ({ open, handleClose, teamId, teamTypeId, defaultValues }: EditChecklistModalProps) => {
  const { mutateAsync: editChecklist, isLoading, isError, error } = useEditChecklist(defaultValues.checklistId);
  const toast = useToast();

  const handleFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const response = await editChecklist(data);
      return response;
    } catch (err) {
      toast.error('Failed to edit checklist');
      throw err;
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <ChecklistFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={handleFormSubmit}
      defaultValues={defaultValues}
      teamId={teamId}
      teamTypeId={teamTypeId}
    />
  );
};

export default EditChecklistModal;
