import { Grid } from '@mui/material';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useAllProjects } from '../../hooks/projects.hooks';
import { useAllReimbursementRequests, useCurrentUserReimbursementRequests } from '../../hooks/finance.hooks';
import { isAdmin, Project, ReimbursementRequest, ReimbursementStatusType } from 'shared';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import FinancePieChart from '../../components/FinancePieChart';


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

  const canViewAllReimbursementRequestsAndTotalBudget = user.isFinance || isAdmin(user.role);

  if (canViewAllReimbursementRequestsAndTotalBudget && allReimbursementRequestsIsError) return <ErrorPage message={allReimbursementRequestsError?.message} />;
  if (userReimbursementRequestIsError) return <ErrorPage message={userReimbursementRequestError?.message} />;
  if (
    (canViewAllReimbursementRequestsAndTotalBudget && (allReimbursementRequestsIsLoading || !allReimbursementRequests)) ||
    userReimbursementRequestIsLoading ||
    !userReimbursementRequests
  )
    return <LoadingIndicator />;

  if (canViewAllReimbursementRequestsAndTotalBudget && allProjectsIsError)
    return <ErrorPage message={allProjectsError?.message} />;
  if (user.isFinance && allProjectsIsError) return <ErrorPage message={allProjectsError?.message} />;
  if (allProjectsIsError) return <ErrorPage message={allProjectsError?.message} />;
  if (
    (canViewAllReimbursementRequestsAndTotalBudget && (allProjectsIsLoading || !allProjects)) ||
    (user.isFinance && (allProjectsIsLoading || !allProjects)) ||
    !allProjects
  )
    return <LoadingIndicator />;

  const displayedReimbursementRequests = (
      (canViewAllReimbursementRequestsAndTotalBudget ? (allReimbursementRequests ? allReimbursementRequests : userReimbursementRequests) : userReimbursementRequests)
    ).filter(
      (request: ReimbursementRequest) =>
        !request.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)
    );
  
    const totalBudget = allProjects.reduce(
      (accumulator: number, currentVal: Project) => accumulator + currentVal.budget,
      0
    );
  
    const totalBalance = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => accumulator + currentVal.totalCost,
      0
    );
  
    const pendingLeadership = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'PENDING_LEADERSHIP_APPROVAL'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const pendingFinance = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'PENDING_FINANCE'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const submittedToSABO = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'SABO_SUBMITTED'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const reimbursed = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'REIMBURSED'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const available = totalBudget - totalBalance;

  return (
    <Grid item xs={12} sm={12} md={4} sx={{ marginTop: '10px' }}>
      {/* TODO: Make this take in actual data */}
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
