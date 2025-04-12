import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { CommonMistakeFormModal, CommonMistakeFormValues } from './CommonMistakeFormModal';
import { useEditPartReviewCommonMistakes } from '../../../hooks/part-review.hooks';
import type { PartReviewCommonMistake } from 'shared';

interface EditCommonMistakeModalProps {
  showModal: boolean;
  handleClose: () => void;
  mistake: PartReviewCommonMistake;
}

const EditCommonMistakeModal: React.FC<EditCommonMistakeModalProps> = ({ showModal, handleClose, mistake }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useEditPartReviewCommonMistakes();

  const onSubmit = async (data: CommonMistakeFormValues) => {
    try {
      await mutateAsync({
        commonMistakeId: mistake.partReviewCommonMistakeId,
        payload: data
      });
      toast.success('Common Mistake updated');
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
      title="Edit Common Mistake"
      defaultValues={{
        title: mistake.title,
        description: mistake.description,
        starred: mistake.starred
      }}
      onSubmit={onSubmit}
      formId="edit-common-mistake-form"
    />
  );
};

export default EditCommonMistakeModal;
