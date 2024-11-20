import { User } from './user-types';

export enum GraphType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE'
}
export enum Graph_Data_Unit {
  CAR = 'CAR',
  PROJECT = 'PROJECT',
  TEAM = 'TEAM',
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  BUDGET = 'BUDGET',
  DESIGN_REVIEW = 'DESIGN_REVIEW',
  USER = 'USER'
}
export enum Measures {
  SUM = 'SUM',
  AVERAGE = 'AVERAGE'
}

export enum Permission {
  EDIT_GRAPH = 'EDIT_GRAPH',
  CREATE_GRAPH = 'CREATE_GRAPH',
  VIEW_GRAPH = 'VIEW_GRAPH',
  DELETE_GRAPH = 'DELETE_GRAPH',
  EDIT_GRAPH_COLLECTION = 'EDIT_GRAPH_COLLECTION',
  CREATE_GRAPH_COLLECTION = 'CREATE_GRAPH_COLLECTION',
  VIEW_GRAPH_COLLECTION = 'VIEW_GRAPH-COLLECTION',
  DELETE_GRAPH_COLLECTION = 'DELETE_GRAPH_COLLECTION'
}

export interface GraphData {
  id: string;
  type: Graph_Data_Unit;
  measures: Measures;
}

export interface GraphCollection {
  organizationId: string;
  graphs: Graph[];
  title: string;
  linkId: string;
  userCreated: User;
  permissions: Permission[];
}

export interface Graph {
  organizationId: string;
  startDate: Date;
  endDate: Date;
  title: string;
  linkId: string;
  graphType: GraphType;
  userCreated: User;
  dataUnit: Graph_Data_Unit;
  dataMeasure: Measures;
  groupBy: Graph_Data_Unit;
  graphCollectionLinkId?: string;
}
