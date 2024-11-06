import { Prisma } from '@prisma/client';
import { Graph, GraphCollection, GraphData, GraphDataUnit, GraphType, Measure, Permission } from 'shared';
import { userTransformer } from './user.transformer';
import { GraphCollectionQueryArgs, GraphDataQueryArgs, GraphQueryArgs } from '../prisma-query-args/statistics.query-args';

const graphTransformer = (graph: Prisma.GraphGetPayload<GraphQueryArgs>): Graph => {
  return {
    startDate: graph.startDate,
    endDate: graph.endDate,
    title: graph.title,
    linkId: graph.linkId,
    graphType: graph.graphType as GraphType,
    userCreated: userTransformer(graph.userCreated),
    userDeleted: graph.userDeleted ? userTransformer(graph.userDeleted) : undefined,
    dateDeleted: graph.dateDeleted ?? undefined,
    graphData: graph.data ? graph.data.map(graphDataTransformer) : [],
    groupBy: graph.groupBy as GraphDataUnit,
    graphCollectionId: graph.graphCollectionLinkId ?? undefined
  };
};

const graphDataTransformer = (graphData: Prisma.Graph_DataGetPayload<GraphDataQueryArgs>): GraphData => {
  return {
    type: graphData.type as GraphDataUnit,
    measure: graphData.measure as Measure,
    value: graphData.value
  };
};

const graphCollectionTransformer = (
  graphCollection: Prisma.Graph_CollectionGetPayload<GraphCollectionQueryArgs>
): GraphCollection => {
  return {
    graphs: graphCollection.graphs ? graphCollection.graphs.map(graphTransformer) : [],
    title: graphCollection.title,
    linkId: graphCollection.linkId,
    userCreated: userTransformer(graphCollection.userCreated),
    userDeleted: graphCollection.userDeleted ? userTransformer(graphCollection.userDeleted) : undefined,
    permissions: graphCollection.permissions as Permission[]
  };
};

export default graphTransformer;
