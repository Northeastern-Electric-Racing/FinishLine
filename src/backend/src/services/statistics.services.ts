import { Graph_Data, Organization, User, Graph_Type, Graph_Data_Unit } from '@prisma/client';
import { Graph } from 'shared';
import prisma from '../prisma/prisma';
import graphTransformer from '../transformers/statistics-graph.transformer';
import { getGraphQueryArgs } from '../prisma-query-args/statistics.query-args';
import { AccessDeniedException } from '../utils/errors.utils';

export default class StatisticsService {
  static async createGraph(
    user: User,
    startDate: Date,
    endDate: Date,
    title: string,
    graphType: Graph_Type,
    graphData: Graph_Data[],
    groupBy: Graph_Data_Unit,
    graphCollectionLinkId: string | undefined,
    organization: Organization
  ): Promise<Graph> {
    if (!user.permissions.includes('CREATE_GRAPH')) {
      throw new AccessDeniedException('You do not have permission to create a graph');
    }

    const graph = await prisma.graph.create({
      data: {
        startDate,
        endDate,
        title,
        graphType,
        userCreatedId: user.userId,
        groupBy,
        organizationId: organization.organizationId,
        graphCollectionLinkId: graphCollectionLinkId || null,
        data: {
          create: graphData.map((data) => ({
            type: data.type,
            measure: data.measure,
            value: data.value
          }))
        }
      },
      ...getGraphQueryArgs(organization.organizationId)
    });

    const createdGraph = graphTransformer(graph);

    return createdGraph;
  }
}
