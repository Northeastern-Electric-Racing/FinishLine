import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { CommonMistakeFormModal, CommonMistakeFormValues } from './CommonMistakeFormModal';
import { useCreateCommonMistake } from '../../../hooks/part-review.hooks';
interface CreateCommonMistakesModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateCommonMistakesModal: React.FC<CreateCommonMistakesModalProps> = ({ showModal, handleClose }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateCommonMistake();

  const onSubmit = async (data: CommonMistakeFormValues) => {
    try {
      await mutateAsync(data);
      toast.success('Common Mistake created');
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <CommonMistakeFormModal
      open={showModal}
      onHide={handleClose}
      title="New Common Mistake"
      defaultValues={{ title: '', description: '', starred: false }}
      onSubmit={onSubmit}
      formId="new-common-mistake-form"
    />
  );
};

export default CreateCommonMistakesModal;
