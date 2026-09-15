import { PartPreview } from 'shared';
import { useCreatePartSubmission } from '../../../../../../hooks/part-review.hooks';
import SubmissionFormModal from './SubmissionFormModal';

interface CreateSubmissionModalProps {
  open: boolean;
  handleClose: () => void;
  partsInProject: PartPreview[];
  currentPart?: PartPreview;
}

const CreateSubmissionModal = ({ open, handleClose, partsInProject, currentPart }: CreateSubmissionModalProps) => {
  const { mutateAsync: createSubmission } = useCreatePartSubmission();

  return (
    <SubmissionFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={createSubmission}
      partsInProject={partsInProject}
      currentPart={currentPart}
    />
  );
};

export default CreateSubmissionModal;
