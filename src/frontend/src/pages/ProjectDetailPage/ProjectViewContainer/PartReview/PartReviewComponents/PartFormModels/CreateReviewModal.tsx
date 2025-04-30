import { PartPreview, Review_Status } from 'shared';
import { useCreatePartReview, useUploadReviewFiles } from '../../../../../../hooks/part-review.hooks';
import ReviewFormModal from './ReviewFormModal';

interface CreateReviewModalProps {
  open: boolean;
  handleClose: () => void;
  partsInProject: PartPreview[];
}

const CreateReviewModal = ({ open, handleClose, partsInProject }: CreateReviewModalProps) => {
  const { mutateAsync: createReview } = useCreatePartReview();
  const { mutateAsync: uploadFiles } = useUploadReviewFiles();

  const onSubmit = async (data: {
    submissionId: string;
    status: Review_Status;
    notes?: string;
    files: { name: string; file: File }[];
  }) => {
    const review = await createReview({
      submissionId: data.submissionId,
      notes: data.notes,
      status: data.status
    });

    await uploadFiles({
      reviewId: review.partReviewId,
      files: data.files.map((file) => file.file)
    });
  };

  return <ReviewFormModal open={open} handleClose={handleClose} onSubmit={onSubmit} partsInProject={partsInProject} />;
};

export default CreateReviewModal;
