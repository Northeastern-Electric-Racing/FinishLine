import { Permission, User } from './user-types';

export enum GraphType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE'
}

export enum GraphDataUnit {
  CAR = 'CAR',
  PROJECT = 'PROJECT',
  TEAM = 'TEAM',
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  BUDGET = 'BUDGET',
  WORK_PACKAGE = 'WORK_PACKAGE',
  REIMBURSEMENT = 'REIMBURSEMENT',
  DESIGN_REVIEW = 'DESIGN_REVIEW',
  USER = 'USER'
}

export enum Measure {
  SUM = 'SUM',
  AVG = 'AVERAGE'
}

export interface GraphData {
  type: GraphDataUnit;
  measure: Measure;
  value: number;
}

export interface Graph {
  startDate: Date;
  endDate: Date;
  title: string;
  linkId: string;
  graphType: GraphType;
  userCreated: User;
  userDeleted?: User;
  dateDeleted?: Date;
  graphData: GraphData[];
  groupBy: GraphDataUnit;
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
