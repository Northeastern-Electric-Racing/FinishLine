import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { ChecklistCreateArgs, useCreateChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import InfoBlockFormModal from './InfoBlockFormModal';
import { Checklist } from 'shared';

interface CreateInfoBlockModalProps {
  open: boolean;
  handleClose: () => void;
  parentChecklist: Checklist;
}

const CreateInfoBlockModal = ({ open, handleClose, parentChecklist }: CreateInfoBlockModalProps) => {
  const { mutateAsync: createChecklist, isLoading, isError, error } = useCreateChecklist();
  const toast = useToast();

  const handleFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const response = await createChecklist(data);
      toast.success('Information block created successfully');
      return response;
    } catch (err) {
      toast.error('Failed to create information block');
      throw err;
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <InfoBlockFormModal open={open} handleClose={handleClose} onSubmit={handleFormSubmit} parentChecklist={parentChecklist} />
  );
};

export default CreateInfoBlockModal;
