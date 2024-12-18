import { Permission, User } from './user-types';

export enum GraphType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE'
}

export enum Measure {
  SUM = 'SUM',
  AVG = 'AVG'
}

export interface GraphGen {
  finalTable: string;
  finalColumn: string;
  groupByColumn: string;
  queryPath: QueryPath;
}

export interface QueryPath {
  table: string;
  primaryKey: string;
  parentForeignKey?: string;
  next?: QueryPath;
}

export interface GraphData {
  value: number;
  label: string;
}

export interface Graph {
  id: string;
  startDate: Date;
  endDate: Date;
  title: string;
  graphType: GraphType;
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
