import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { FrequentlyAskedQuestion } from 'shared';
import { useEditFaq } from '../../../hooks/recruitment.hooks';
import FaqFormModal from './FaqFormModal';

interface EditFaqFormModalProps {
  open: boolean;
  handleClose: () => void;
  faq: FrequentlyAskedQuestion;
}

const EditFaqFormModal = ({ open, handleClose, faq }: EditFaqFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditFaq(faq.faqId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <FaqFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={faq} />;
};

export default EditFaqFormModal;
