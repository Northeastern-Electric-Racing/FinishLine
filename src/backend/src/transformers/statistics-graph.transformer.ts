import { Prisma } from '@prisma/client';
import { Graph, GraphData, GraphDisplayType, GraphType, Measure, SpecialPermission } from 'shared';
import { userTransformer } from './user.transformer';
import { GraphQueryArgs } from '../prisma-query-args/statistics.query-args';

const graphTransformer = (graph: Prisma.GraphGetPayload<GraphQueryArgs> & { graphData: GraphData[] }): Graph => {
  return {
    graphId: graph.id,
    ...graph,
    graphType: graph.graphType as GraphType,
    graphDisplayType: graph.displayGraphType as GraphDisplayType,
    measure: graph.measure as Measure,
    userCreated: userTransformer(graph.userCreated),
    userDeleted: graph.userDeleted ? userTransformer(graph.userDeleted) : undefined,
    dateDeleted: graph.dateDeleted ?? undefined,
    graphCollectionId: graph.graphCollectionId ?? undefined,
    startDate: graph.startDate ?? undefined,
    endDate: graph.endDate ?? undefined,
    carIds: graph.cars.map((car) => car.carId),
    specialPermissions: graph.specialPermissions as SpecialPermission[]
  };
};

export default graphTransformer;
