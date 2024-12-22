import { Prisma } from '@prisma/client';
import { Graph, GraphData, GraphDisplayType, GraphType, SpecialPermission, GraphCollection } from 'shared';
import { userTransformer } from './user.transformer';
import { GraphQueryArgs, GraphCollectionQueryArgs } from '../prisma-query-args/statistics.query-args';

const graphTransformer = (graph: Prisma.GraphGetPayload<GraphQueryArgs> & { graphData: GraphData[] }): Graph => {
  return {
    graphId: graph.id,
    ...graph,
    graphType: graph.graphType as GraphType,
    graphDisplayType: graph.displayGraphType as GraphDisplayType,
    userCreated: userTransformer(graph.userCreated),
    userDeleted: graph.userDeleted ? userTransformer(graph.userDeleted) : undefined,
    dateDeleted: graph.dateDeleted ?? undefined,
    graphCollectionId: graph.graphCollectionId ?? undefined,
    startDate: graph.startDate ?? undefined,
    endDate: graph.endDate ?? undefined,
    specialPermissions: graph.specialPermissions as SpecialPermission[]
  };
};

export const graphCollectionTransformer = (
  graphCollection: Prisma.Graph_CollectionGetPayload<GraphCollectionQueryArgs> & {
    graphs: (Prisma.GraphGetPayload<GraphCollectionQueryArgs['include']['graphs']> & { graphData: [] })[];
  }
): GraphCollection => {
  return {
    id: graphCollection.id,
    title: graphCollection.title,
    linkId: graphCollection.id,
    permissions: graphCollection.viewPermissions as SpecialPermission[],
    graphs: graphCollection.graphs.map((graph) =>
      graphTransformer({
        ...graph,
        graphData: []
      })
    ),
    userCreated: userTransformer(graphCollection.userCreated),
    userDeleted: graphCollection.userDeleted ? userTransformer(graphCollection.userDeleted) : undefined,
    dateDeleted: graphCollection.dateDeleted ?? undefined
  };
};

export default graphTransformer;
