import prisma from '../prisma/prisma';
import { Prisma } from '@prisma/client';
import { Organization } from '@prisma/client';
import { Graph, GraphData } from 'shared';
import { NotFoundException } from '../utils/errors.utils';
import { getGraphQueryArgs } from '../prisma-query-args/statistics.query-args';
import graphTransformer from '../transformers/statistics-graph.transformer';
import { GraphQueryArgs } from '../prisma-query-args/statistics.query-args';


export default class GraphService {
  /**
   * Gets the graph with the specified graph data id.
   * @param graphDataId the unique id of the requested graph
   */
  static async getSingleGraph(id: string, organization: Organization): Promise<Graph> {
    const requestedGraph = await prisma.graph.findUnique({
      where: { id },
      ...getGraphQueryArgs(organization.organizationId)
    });

    if (!requestedGraph) throw new NotFoundException('Graph', id);

    return graphTransformer(requestedGraph as Prisma.GraphGetPayload<GraphQueryArgs>& { graphData: GraphData[] });
  }
}
