import { FrequentlyAskedQuestion } from 'shared';
import { FaqPayload, useEditFaq } from '../../../../hooks/recruitment.hooks';
import FaqFormModal from '../../RecruitmentConfig/FaqFormModal';
import { useToast } from '../../../../hooks/toasts.hooks';

interface EditNewMemberFaqFormModalProps {
  open: boolean;
  handleClose: () => void;
  faq: FrequentlyAskedQuestion;
}

const EditNewMemberFaqFormModal = ({ open, handleClose, faq }: EditNewMemberFaqFormModalProps) => {
  const { mutateAsync } = useEditFaq(faq.faqId);
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

  return <FaqFormModal open={open} handleClose={handleClose} onSubmit={onSubmit} defaultValues={faq} />;
};

export default EditNewMemberFaqFormModal;
