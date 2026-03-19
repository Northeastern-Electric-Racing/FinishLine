import NERModal from '../../../components/NERModal';
import { useMarkReimbursementRequestAsSaboSubmitted } from '../../../hooks/finance.hooks';
import { ReimbursementRequest } from 'shared';
import { useToast } from '../../../hooks/toasts.hooks';
import { Typography } from '@mui/material';

interface MarkSubmittedToSaboModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  reimbursementRequest: ReimbursementRequest;
}

const MarkSubmittedToSaboModal = ({ open, setOpen, reimbursementRequest }: MarkSubmittedToSaboModalProps) => {
  const { mutateAsync: markAsSaboSubmitted } = useMarkReimbursementRequestAsSaboSubmitted(
    reimbursementRequest.reimbursementRequestId
  );
  const toast = useToast();

  const handleMarkSubmittedToSabo = async () => {
    try {
      await markAsSaboSubmitted();
      toast.success('Successfully marked reimbursement request as submitted to SABO');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
    setOpen(false);
  };

  return (
    <NERModal
      open={open}
      onHide={() => setOpen(false)}
      title="Mark Submitted to SABO"
      submitText="Mark Submitted"
      onSubmit={() => handleMarkSubmittedToSabo()}
    >
      <Typography>
        Are you sure you want to mark this reimbursement request as submitted to SABO? This should only be done after you
        have approved the reimbursement in Concur.
      </Typography>
    </NERModal>
  );
};

export default MarkSubmittedToSaboModal;
