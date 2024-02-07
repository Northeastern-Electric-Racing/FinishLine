import { ClubAccount, ReimbursementRequest } from 'shared';
import NERModal from '../../../components/NERModal';
import { Box } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import { centsToDollar } from '../../../utils/pipes';

interface TotalAmountSpentModalProps {
  open: boolean;
  allReimbursementRequests: ReimbursementRequest[];
  onHide: () => void;
}
const TotalAmountSpentModal: React.FC<TotalAmountSpentModalProps> = ({ open, allReimbursementRequests, onHide }) => {
  const cashAccountSpent = centsToDollar(
    allReimbursementRequests
      .filter((request) => request.account === ClubAccount.CASH)
      .reduce((acc, curr) => {
        return acc + curr.totalCost;
      }, 0)
  );

  const budgetAccountSpent = centsToDollar(
    allReimbursementRequests
      .filter((request) => request.account === ClubAccount.BUDGET)
      .reduce((acc, curr) => {
        return acc + curr.totalCost;
      }, 0)
  );

  return (
    <NERModal open={open} title={'Total Amount Spent'} onHide={onHide} hideFormButtons showCloseButton>
      <Box display={'flex'} gap={2}>
        <DetailDisplay label={'Cash (830667)'} content={'$' + cashAccountSpent} />
        <DetailDisplay label={'Budget (800462)'} content={'$' + budgetAccountSpent} />
      </Box>
    </NERModal>
  );
};

export default TotalAmountSpentModal;
