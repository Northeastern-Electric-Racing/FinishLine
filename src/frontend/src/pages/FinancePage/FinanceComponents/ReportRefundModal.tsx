import { useReportRefund } from '../../../hooks/finance.hooks';
import RefundModal from './RefundModal';

interface ReportRefundModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const ReportRefundModal: React.FC<ReportRefundModalProps> = ({ showModal, handleClose }: ReportRefundModalProps) => {
  const { mutateAsync, isLoading } = useReportRefund();

  return (
    <RefundModal
      showModal={showModal}
      handleClose={handleClose}
      mutateAsync={mutateAsync}
      isLoading={isLoading}
      title="Report New Account Credit"
    />
  );
};

export default ReportRefundModal;
