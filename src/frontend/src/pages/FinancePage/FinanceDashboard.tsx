import { Grid } from '@mui/material';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useAllProjects } from '../../hooks/projects.hooks';
import { useAllReimbursementRequests, useCurrentUserReimbursementRequests } from '../../hooks/finance.hooks';
import { isAdmin, isHead, isLead, isMember, Project, ReimbursementRequest, ReimbursementStatusType } from 'shared';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import FinancePieChart from './FinanceComponents/PieChart';

const FinanceDashboard = () => {
  const user = useCurrentUser();

  const {
    data: allProjects,
    isLoading: allProjectsIsLoading,
    isError: allProjectsIsError,
    error: allProjectsError
  } = useAllProjects();

  const {
    data: userReimbursementRequests,
    isLoading: userReimbursementRequestIsLoading,
    isError: userReimbursementRequestIsError,
    error: userReimbursementRequestError
  } = useCurrentUserReimbursementRequests();

  const {
    data: allReimbursementRequests,
    isLoading: allReimbursementRequestsIsLoading,
    isError: allReimbursementRequestsIsError,
    error: allReimbursementRequestsError
  } = useAllReimbursementRequests();

  const isAdminChiefFinance = user.isFinance || isAdmin(user.role);
  const isMemberLead = isMember(user.role) || isLead(user.role);
  const isHeadRole = isHead(user.role);

  const displayedReimbursementRequests = (
    isAdminChiefFinance
      ? allReimbursementRequests
        ? allReimbursementRequests
        : userReimbursementRequests
      : userReimbursementRequests
  ).filter(
    (request: ReimbursementRequest) =>
      !request.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)
  );

  return (
    <Grid item xs={12} sm={12} md={4} sx={{ marginTop: '10px' }}>
      <FinancePieChart
        totalBalance={totalBudget}
        pendingLeadership={pendingLeadership}
        pendingFinance={pendingFinance}
        submittedToSABO={submittedToSABO}
        reimbursed={reimbursed}
        available={available}
      />
    </Grid>
  );
};

export default FinanceDashboard;
