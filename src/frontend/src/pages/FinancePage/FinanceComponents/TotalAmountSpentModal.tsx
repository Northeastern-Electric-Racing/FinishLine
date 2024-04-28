import { ClubAccount, ReimbursementProduct, ReimbursementRequest, Team, WBSElementData } from 'shared';
import NERModal from '../../../components/NERModal';
import { Box } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import { centsToDollar } from '../../../utils/pipes';
import { isReimbursementRequestDenied } from '../../../utils/reimbursement-request.utils';
import { useAllTeams } from '../../../hooks/teams.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface TotalAmountSpentModalProps {
  open: boolean;
  allReimbursementRequests: ReimbursementRequest[];
  onHide: () => void;
}
const TotalAmountSpentModal: React.FC<TotalAmountSpentModalProps> = ({ open, allReimbursementRequests, onHide }) => {
  const { data: teams, isLoading, isError, error } = useAllTeams();
  let teamToCost = new Map<string, number>();

  if (!teams || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} />;

  const unDeniedReimbursementRequests = allReimbursementRequests.filter((request) => !isReimbursementRequestDenied(request));

  const allReimbursementProducts = unDeniedReimbursementRequests.reduce(
    (acc: ReimbursementProduct[], curr: ReimbursementRequest) => acc.concat(curr.reimbursementProducts),
    []
  );

  const nonProjectProducts = allReimbursementProducts.filter(
    (product: ReimbursementProduct) => !(product.reimbursementProductReason as any).wbsNum
  );

  const projectProducts = allReimbursementProducts.filter(
    (product: ReimbursementProduct) => (product.reimbursementProductReason as any).wbsNum
  );

  const nonCarCosts = nonProjectProducts.map((product: ReimbursementProduct) => product.cost);
  const carCosts = projectProducts.map((product: ReimbursementProduct) => product.cost);

  teams.map((team) => teamToCost.set(team.teamName, 0));

  projectProducts.map((product: ReimbursementProduct) => {
    const team = (product.reimbursementProductReason as WBSElementData).team;
    if (team) {
      if (teamToCost.has(team.teamName)) {
        const oldCost = teamToCost.get(team.teamName);
        teamToCost.set(team.teamName, oldCost! + product.cost);
      }
    }
  });

  console.log(teamToCost);

  const nonCarTotal = centsToDollar(
    nonCarCosts.reduce((acc, curr) => {
      return acc + curr;
    }, 0)
  );

  const carTotal = centsToDollar(
    carCosts.reduce((acc, curr) => {
      return acc + curr;
    }, 0)
  );

  return (
    <NERModal open={open} title={'Total Amount Spent'} onHide={onHide} hideFormButtons showCloseButton>
      <Box display={'flex'} gap={2}>
        <DetailDisplay label={'NonCar (830667)'} content={'$' + nonCarTotal} />
        <DetailDisplay label={'Car (800462)'} content={'$' + carTotal} />
      </Box>
    </NERModal>
  );
};

export default TotalAmountSpentModal;
