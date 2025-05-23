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

  const onSubmit = async (data: { partId: string; name: string; notes?: string; fileIds: string[] }) => {
    await createSubmission({
      partId: data.partId,
      name: data.name,
      fileIds: data.fileIds,
      notes: data.notes
    });
  };

  return (
    <SubmissionFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={onSubmit}
      partsInProject={partsInProject}
      currentPart={currentPart}
    />
  );
};

export default CreateSubmissionModal;
