import { Permission, User } from './user-types';

export enum GraphDisplayType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE'
}

export enum GraphType {
  CHANGE_REQUESTS_BY_DIVISION = 'CHANGE_REQUESTS_BY_DIVISION',
  CHANGE_REQUESTS_BY_PROJECT = 'CHANGE_REQUESTS_BY_PROJECT',
  CHANGE_REQUESTS_BY_TEAM = 'CHANGE_REQUESTS_BY_TEAM',
  PROJECT_BUDGET_BY_DIVISION = 'PROJECT_BUDGET_BY_DIVISION',
  PROJECT_BUDGET_BY_PROJECT = 'PROJECT_BUDGET_BY_PROJECT',
  PROJECT_BUDGET_BY_TEAM = 'PROJECT_BUDGET_BY_TEAM',
  REIMBURSEMENT_TOTAL_BY_DIVISION = 'REIMBURSEMENT_TOTAL_BY_DIVISION',
  REIMBURSEMENT_TOTAL_BY_PROJECT = 'REIMBURSEMENT_TOTAL_BY_PROJECT',
  REIMBURSEMENT_TOTAL_BY_TEAM = 'REIMBURSEMENT_TOTAL_BY_TEAM'
}

export enum Measure {
  SUM = 'SUM',
  AVG = 'AVG'
}

export interface GraphData {
  value: number;
  label: string;
}

export interface Graph {
  graphId: string;
  startDate?: Date;
  endDate?: Date;
  title: string;
  graphType: GraphType;
  graphDisplayType: GraphDisplayType;
  userCreated: User;
  userDeleted?: User;
  dateDeleted?: Date;
  graphData: GraphData[];
  graphCollectionId?: String;
}

export interface GraphCollection {
  graphs: Graph[];
  title: string;
  linkId: string;
  userCreated: User;
  userDeleted?: User;
  dateDeleted?: Date;
  permissions: Permission[];
}
