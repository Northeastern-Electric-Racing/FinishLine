import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import PartReviewFAQFormModal from './PartReviewFAQFormModal';
import { useCreatePartReviewFaq } from '../../../../hooks/part-review.hooks';

interface CreatePartReviewFAQModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreatePartReviewFAQModal = ({ open, handleClose }: CreatePartReviewFAQModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreatePartReviewFaq();

  if (isError && error instanceof Error) return <ErrorPage message={error.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <PartReviewFAQFormModal open={open} handleClose={handleClose}
  onSubmit={async (data) => {
    await mutateAsync(data); // 👈 convert to Promise<void>
  }}
/>;
};

export default CreatePartReviewFAQModal;
