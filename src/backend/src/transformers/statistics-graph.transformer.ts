import { Prisma } from '@prisma/client';
import { Graph, GraphData, GraphDataUnit, GraphType, Measure } from 'shared';
import { userTransformer } from './user.transformer';
import { GraphDataQueryArgs, GraphQueryArgs } from '../prisma-query-args/statistics.query-args';

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

export default graphTransformer;
