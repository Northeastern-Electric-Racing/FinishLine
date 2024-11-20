import { Measures, Permission, Graph_Data_Unit, Graph_Type, Prisma } from '@prisma/client';
import {
  Graph,
  GraphType,
  Graph_Data_Unit as GraphDataUnit,
  GraphCollection,
  Permission as Permissions,
  Measures as Measure
} from 'shared';
import { userTransformer } from './user.transformer';
import { GraphCollectionQueryArgs, GraphQueryArgs } from '../prisma-query-args/graph.query-args';

export const convertGraphType = (graphType: Graph_Type): GraphType =>
  ({
    BAR: GraphType.BAR,
    LINE: GraphType.LINE,
    PIE: GraphType.PIE
  }[graphType]);

export const convertGraphDataUnit = (dataUnit: Graph_Data_Unit): GraphDataUnit =>
  ({
    CAR: GraphDataUnit.CAR,
    PROJECT: GraphDataUnit.PROJECT,
    TEAM: GraphDataUnit.TEAM,
    CHANGE_REQUEST: GraphDataUnit.CHANGE_REQUEST,
    BUDGET: GraphDataUnit.BUDGET,
    DESIGN_REVIEW: GraphDataUnit.DESIGN_REVIEW,
    USER: GraphDataUnit.USER
  }[dataUnit]);

export const convertPermissions = (permission: Permission): Permissions =>
  ({
    EDIT_GRAPH: Permissions.EDIT_GRAPH,
    CREATE_GRAPH: Permissions.CREATE_GRAPH,
    VIEW_GRAPH: Permissions.VIEW_GRAPH,
    DELETE_GRAPH: Permissions.DELETE_GRAPH,
    EDIT_GRAPH_COLLECTION: Permissions.EDIT_GRAPH_COLLECTION,
    CREATE_GRAPH_COLLECTION: Permissions.CREATE_GRAPH_COLLECTION,
    VIEW_GRAPH_COLLECTION: Permissions.VIEW_GRAPH_COLLECTION,
    DELETE_GRAPH_COLLECTION: Permissions.DELETE_GRAPH_COLLECTION
  }[permission]);

export const convertGraphMeasures = (measure: Measures): Measure =>
  ({
    SUM: Measure.SUM,
    AVERAGE: Measure.AVERAGE
  }[measure]);

export const graphTransformer = (graph: Prisma.GraphGetPayload<GraphQueryArgs>): Graph => {
  return {
    organizationId: graph.organizationId,
    startDate: graph.startDate,
    endDate: graph.endDate,
    title: graph.title,
    linkId: graph.linkId,
    graphType: convertGraphType(graph.graphType),
    userCreated: userTransformer(graph.userCreated),
    dataUnit: convertGraphDataUnit(graph.data.type),
    dataMeasure: convertGraphMeasures(graph.data.measures),
    groupBy: convertGraphDataUnit(graph.groupBy),
    graphCollectionLinkId: graph.graphCollectionLinkId ? graph.graphCollectionLinkId : undefined
  };
};

export const graphCollectionTransformer = (
  collection: Prisma.GraphCollectionGetPayload<GraphCollectionQueryArgs>
): GraphCollection => {
  return {
    organizationId: collection.organizationId,
    graphs: collection.graphs.map(graphTransformer),
    title: collection.title,
    linkId: collection.linkId,
    userCreated: userTransformer(collection.userCreated),
    permissions: collection.permissions.map(convertPermissions)
  };
};
