import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { ChecklistCreateArgs, useEditChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import SubtaskFormModal from './SubtaskFormModal';
import { Checklist, ChecklistPreview } from 'shared';

interface EditSubtaskModalProps {
  open: boolean;
  handleClose: () => void;
  parentChecklist: Checklist;
  defaultValues: ChecklistPreview;
}

const EditSubtaskModal = ({ open, handleClose, parentChecklist, defaultValues }: EditSubtaskModalProps) => {
  const { mutateAsync: editChecklist, isLoading, isError, error } = useEditChecklist(defaultValues.checklistId);
  const toast = useToast();

  const handleFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const response = await editChecklist(data);
      return response;
    } catch (err) {
      toast.error('Failed to create checklist');
      throw err;
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <SubtaskFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={handleFormSubmit}
      parentChecklist={parentChecklist}
      defaultValues={defaultValues}
    />
  );
};

export default EditSubtaskModal;
