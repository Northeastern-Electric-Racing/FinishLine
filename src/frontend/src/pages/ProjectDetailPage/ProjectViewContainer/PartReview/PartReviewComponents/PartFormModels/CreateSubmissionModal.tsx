import { PartPreview } from 'shared';
import { useCreatePartSubmission, useUploadSubmissionFiles } from '../../../../../../hooks/part-review.hooks';
import SubmissionFormModal from './SubmissionFormModal';

interface CreateSubmissionModalProps {
  open: boolean;
  handleClose: () => void;
  partsInProject: PartPreview[];
}

const CreateSubmissionModal = ({ open, handleClose, partsInProject }: CreateSubmissionModalProps) => {
  const { mutateAsync: createSubmission } = useCreatePartSubmission();
  const { mutateAsync: uploadFiles } = useUploadSubmissionFiles();

  const onSubmit = async (data: { partId: string; name: string; notes?: string; files: { name: string; file: File }[] }) => {
    const submission = await createSubmission({
      partId: data.partId,
      name: data.name,
      notes: data.notes
    });

    await uploadFiles({
      submissionId: submission.partSubmissionId,
      files: data.files.map((file) => file.file)
    });
  };

  return <SubmissionFormModal open={open} handleClose={handleClose} onSubmit={onSubmit} partsInProject={partsInProject} />;
};

export default CreateSubmissionModal;
