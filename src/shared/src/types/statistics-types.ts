import { User } from './user-types';

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

export enum SpecialPermission {
  FINANCE_ONLY = 'FINANCE_ONLY'
}

export enum Measure {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT'
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
  measure: Measure;
  graphType: GraphType;
  graphDisplayType: GraphDisplayType;
  userCreated: User;
  userDeleted?: User;
  dateDeleted?: Date;
  graphData: GraphData[];
  graphCollectionId?: String;
  carIds: string[];
  specialPermissions: SpecialPermission[];
}

export interface GraphCollection {
  id: string;
  graphs: Graph[];
  title: string;
  linkId: string;
  userCreated: User;
  userDeleted?: User;
  dateDeleted?: Date;
  dateCreated: Date;
  permissions: SpecialPermission[];
}

export interface CreateGraphArgs {
  startDate?: Date;
  endDate?: Date;
  title: String;
  graphType: GraphType;
  measure: Measure;
  graphCollectionId?: string;
  graphDisplayType: GraphDisplayType;
  carIds: String[];
}

export interface GraphFormInput {
  title: string;
  measure: Measure;
  graphType: GraphType | null;
  startTime?: Date;
  endTime?: Date;
  graphDisplayType: GraphDisplayType;
  graphCollectionId?: string;
  carIds: string[];
  specialPermissions: SpecialPermission[];
}

export interface GraphCollectionFormInput {
  title: string;
  specialPermissions: SpecialPermission[];
}
