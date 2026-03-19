import { Graph, GraphCollection } from 'shared';
import { userTransformer } from './users.transformers';

export const graphTransformer = (graph: Graph): Graph => {
  return {
    ...graph,
    userCreated: userTransformer(graph.userCreated),
    userDeleted: graph.userDeleted ? userTransformer(graph.userDeleted) : undefined,
    startDate: graph.startDate ? new Date(graph.startDate) : undefined,
    endDate: graph.endDate ? new Date(graph.endDate) : undefined,
    dateDeleted: graph.dateDeleted ? new Date(graph.dateDeleted) : undefined
  };
};

export const graphCollectionTransformer = (graphCollection: GraphCollection): GraphCollection => {
  return {
    ...graphCollection,
    userCreated: userTransformer(graphCollection.userCreated),
    userDeleted: graphCollection.userDeleted ? userTransformer(graphCollection.userDeleted) : undefined,
    dateDeleted: graphCollection.dateDeleted ? new Date(graphCollection.dateDeleted) : undefined,
    dateCreated: new Date(graphCollection.dateCreated),
    graphs: graphCollection.graphs.map(graphTransformer)
  };
};
