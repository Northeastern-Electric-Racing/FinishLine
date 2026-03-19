import { Reimbursement } from 'shared';
import { useEditRefund } from '../../../hooks/finance.hooks';
import RefundModal, { RefundModalInputs } from './RefundModal';

interface EditRefundModalProps {
  refund?: Reimbursement;
  handleClose: () => void;
}

const EditRefundModal: React.FC<EditRefundModalProps> = ({ refund, handleClose }: EditRefundModalProps) => {
  const { mutateAsync, isLoading } = useEditRefund(refund!.reimbursementId);

  const defaultValues: RefundModalInputs | undefined = refund && {
    amount: (refund.amount / 100).toFixed(2),
    dateReceived: new Date(refund.dateCreated)
  };

  return (
    <RefundModal
      showModal={!!refund}
      handleClose={handleClose}
      mutateAsync={mutateAsync}
      isLoading={isLoading}
      defaultValues={defaultValues}
      title="Edit Refund"
    />
  );
};

export default EditRefundModal;
