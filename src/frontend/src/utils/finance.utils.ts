import { Project, ReimbursementRequest } from 'shared';

// returns the total cost across all given reimbursement requests
export const getTotalRRBalance = (displayedReimbursementRequests: ReimbursementRequest[]): Number => {
  return displayedReimbursementRequests.reduce(
    (accumulator: number, currentVal: ReimbursementRequest) => accumulator + currentVal.totalCost,
    0
  );
};

// returns the budget across all given projects
export const getTotalProjectBudget = (displayedProjects: Project[]): Number => {
  return displayedProjects.reduce((accumulator: number, currentVal: Project) => accumulator + currentVal.budget, 0);
};

// returns the total cost across all given reimbursement requests marked pending leadership
export const getPendingLeadershipRRBalance = (displayedReimbursementRequests: ReimbursementRequest[]): Number => {
  return displayedReimbursementRequests.reduce((accumulator: number, currentVal: ReimbursementRequest) => {
    if (
      currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 'PENDING_LEADERSHIP_APPROVAL'
    ) {
      return accumulator + currentVal.totalCost;
    }
    return accumulator;
  }, 0);
};

// returns the total cost across all given reimbursement requests marked pending finance
export const getPendingFinanceRRBalance = (displayedReimbursementRequests: ReimbursementRequest[]): Number => {
  return displayedReimbursementRequests.reduce((accumulator: number, currentVal: ReimbursementRequest) => {
    if (currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 'PENDING_FINANCE') {
      return accumulator + currentVal.totalCost;
    }
    return accumulator;
  }, 0);
};

// returns the total cost across all given reimbursement requests marked submitted to SABO
export const getSubmittedToSaboRRBalance = (displayedReimbursementRequests: ReimbursementRequest[]): Number => {
  return displayedReimbursementRequests.reduce((accumulator: number, currentVal: ReimbursementRequest) => {
    if (currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 'SABO_SUBMITTED') {
      return accumulator + currentVal.totalCost;
    }
    return accumulator;
  }, 0);
};

// returns the total cost across all given reimbursement requests marked reimbursed
export const getReimbursedRRBalance = (displayedReimbursementRequests: ReimbursementRequest[]): Number => {
  return displayedReimbursementRequests.reduce((accumulator: number, currentVal: ReimbursementRequest) => {
    if (currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 'REIMBURSED') {
      return accumulator + currentVal.totalCost;
    }
    return accumulator;
  }, 0);
};
