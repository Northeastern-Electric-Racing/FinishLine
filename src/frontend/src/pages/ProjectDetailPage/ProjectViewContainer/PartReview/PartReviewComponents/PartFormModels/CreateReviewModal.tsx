import { PartPreview, Review_Status } from 'shared';
import { useCreatePartReview } from '../../../../../../hooks/part-review.hooks';
import ReviewFormModal from './ReviewFormModal';

interface CreateReviewModalProps {
  open: boolean;
  handleClose: () => void;
  partsInProject: PartPreview[];
}

const CreateReviewModal = ({ open, handleClose, partsInProject }: CreateReviewModalProps) => {
  const { mutateAsync: createReview } = useCreatePartReview();

  const onSubmit = async (data: { submissionId: string; status: Review_Status; notes?: string; fileIds: string[] }) => {
    await createReview({
      submissionId: data.submissionId,
      notes: data.notes,
      fileIds: data.fileIds,
      status: data.status
    });
  };

  return <ReviewFormModal open={open} handleClose={handleClose} onSubmit={onSubmit} partsInProject={partsInProject} />;
};

export default CreateReviewModal;
