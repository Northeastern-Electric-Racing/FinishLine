import { PartPreview } from 'shared';
import { useCreatePartReview } from '../../../../../../hooks/part-review.hooks';
import ReviewFormModal from './ReviewFormModal';

interface CreateReviewModalProps {
  open: boolean;
  handleClose: () => void;
  partsInProject: PartPreview[];
}

const CreateReviewModal = ({ open, handleClose, partsInProject }: CreateReviewModalProps) => {
  const { mutateAsync: createReview } = useCreatePartReview();

  return <ReviewFormModal open={open} handleClose={handleClose} onSubmit={createReview} partsInProject={partsInProject} />;
};

export default CreateReviewModal;
