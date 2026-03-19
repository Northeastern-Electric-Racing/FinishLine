import { Prisma } from '@prisma/client';
import { userTransformer } from './user.transformer.js';
import { GraphCollectionQueryArgs, GraphQueryArgs } from '../prisma-query-args/statistics.query-args.js';
import { GraphCollection, GraphData, Graph, SpecialPermission } from 'shared';
import graphTransformer from './statistics-graph.transformer.js';

export const graphCollectionTransformer = (
  graphCollection: Prisma.Graph_CollectionGetPayload<GraphCollectionQueryArgs>,
  graphs: (Prisma.GraphGetPayload<GraphQueryArgs> & { graphData: GraphData[] })[]
): GraphCollection => {
  return {
    ...graphCollection,
    userCreated: userTransformer(graphCollection.userCreated),
    userDeleted: graphCollection.userDeleted ? userTransformer(graphCollection.userDeleted) : undefined,
    dateDeleted: graphCollection.dateDeleted ?? undefined,
    graphs: graphs.map((graph) => {
      return graphTransformer({ ...graph, graphData: graph.graphData });
    }) as Graph[],
    title: graphCollection.title,
    linkId: graphCollection.id,
    permissions: graphCollection.viewPermissions as SpecialPermission[],
    dateCreated: graphCollection.dateCreated
  };
};
