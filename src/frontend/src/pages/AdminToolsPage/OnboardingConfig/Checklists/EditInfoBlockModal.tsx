import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { ChecklistCreateArgs, useEditChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import InfoBlockFormModal from './InfoBlockFormModal';
import { Checklist, ChecklistPreview } from 'shared';

interface EditInfoBlockModalProps {
  open: boolean;
  handleClose: () => void;
  parentChecklist: Checklist;
  defaultValues: ChecklistPreview;
}

const EditInfoBlockModal = ({ open, handleClose, parentChecklist, defaultValues }: EditInfoBlockModalProps) => {
  const { mutateAsync: editChecklist, isLoading, isError, error } = useEditChecklist(defaultValues.checklistId);
  const toast = useToast();

  const handleFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const response = await editChecklist(data);
      toast.success('Information block updated successfully');
      return response;
    } catch (err) {
      toast.error('Failed to update information block');
      throw err;
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <InfoBlockFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={handleFormSubmit}
      parentChecklist={parentChecklist}
      defaultValues={defaultValues}
    />
  );
};

export default EditInfoBlockModal;
