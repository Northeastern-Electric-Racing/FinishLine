import { Prisma } from '@prisma/client';
import { Graph, GraphData, GraphType } from 'shared';
import { userTransformer } from './user.transformer';
import { GraphQueryArgs } from '../prisma-query-args/statistics.query-args';

const graphTransformer = (graph: Prisma.GraphGetPayload<GraphQueryArgs> & { graphData: GraphData[] }): Graph => {
  return {
    ...graph,
    graphType: graph.graphType as GraphType,
    userCreated: userTransformer(graph.userCreated),
    userDeleted: graph.userDeleted ? userTransformer(graph.userDeleted) : undefined,
    dateDeleted: graph.dateDeleted ?? undefined,
    graphCollectionId: graph.graphCollectionId ?? undefined
  };
};

export default graphTransformer;
