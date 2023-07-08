import { ReimbursementStatus } from 'shared';

export const getCurrentReimbursementStatus = (statuses: ReimbursementStatus[]) => {
  return statuses.sort((a: ReimbursementStatus, b: ReimbursementStatus) => (a.dateCreated > b.dateCreated ? -1 : 1))[0];
};
