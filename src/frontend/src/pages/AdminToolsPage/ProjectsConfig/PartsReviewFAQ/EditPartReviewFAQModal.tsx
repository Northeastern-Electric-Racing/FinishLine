import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import PartReviewFAQFormModal from './PartReviewFAQFormModal';
import { FrequentlyAskedQuestion } from 'shared';
import { useEditPartReviewFaq } from '../../../../hooks/part-review.hooks';

interface EditPartReviewFAQModalProps {
  open: boolean;
  handleClose: () => void;
  faq: FrequentlyAskedQuestion;
}

const EditPartReviewFAQModal = ({ open, handleClose, faq }: EditPartReviewFAQModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditPartReviewFaq();

  if (isError && error instanceof Error) return <ErrorPage message={error.message} />;
  if (isLoading) return <LoadingIndicator />;

  const handleSubmit = async (data: { question: string; answer: string }) => {
    await mutateAsync({ faqId: faq.faqId, payload: data });
  };

  return (
    <PartReviewFAQFormModal
      open={open}
      handleClose={handleClose}
      defaultValues={faq}
      onSubmit={handleSubmit}
    />
  );
};

export default EditPartReviewFAQModal;
