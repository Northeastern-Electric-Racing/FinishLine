import { FaqPayload, useCreateNewMemberFaq } from '../../../../hooks/recruitment.hooks';
import FaqFormModal from '../../RecruitmentConfig/FaqFormModal';
import { useToast } from '../../../../hooks/toasts.hooks';

interface CreateNewMemberFaqFormModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateNewMemberFaqFormModal = ({ open, handleClose }: CreateNewMemberFaqFormModalProps) => {
  const { mutateAsync } = useCreateNewMemberFaq();
  const toast = useToast();

  const onSubmit = async (data: FaqPayload) => {
    try {
      return await mutateAsync(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  return <FaqFormModal open={open} handleClose={handleClose} onSubmit={onSubmit} />;
};

export default CreateNewMemberFaqFormModal;
