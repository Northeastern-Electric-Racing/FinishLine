import prisma from '../prisma/prisma';
import { Organization } from '@prisma/client';
import { Graph } from 'shared';
import { graphTransformer } from '../transformers/graph.transformer';
import { NotFoundException } from '../utils/errors.utils';
import { getGraphQueryArgs } from '../prisma-query-args/graph.query-args';

export default class GraphService {
  /**
   * Gets the graph with the specified graph data id.
   * @param graphDataId the unique id of the requested graph
   */
  static async getSingleGraph(graphDataId: string, organization: Organization): Promise<Graph> {
    const requestedGraph = await prisma.graph.findUnique({
      where: { graphDataId },
      ...getGraphQueryArgs(organization.organizationId)
    });
    if (!requestedGraph) throw new NotFoundException('Graph', graphDataId);

    return graphTransformer(requestedGraph);
  }
}
