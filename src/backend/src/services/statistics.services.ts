import { Organization, User, Graph_Type, Measure, Graph_Display_Type, Special_Permission, Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';
import { DeletedException, InvalidOrganizationException, NotFoundException } from '../utils/errors.utils';
import graphTransformer from '../transformers/statistics-graph.transformer';
import { getGraphQueryArgs, getGraphCollectionQueryArgs, GraphQueryArgs } from '../prisma-query-args/statistics.query-args';
import { userHasPermissionNew } from '../utils/users.utils';
import { AccessDeniedException, HttpException } from '../utils/errors.utils';
import { Graph, GraphCollection, GraphData, isUnderWordCount, Permission } from 'shared';
import { getGraphData } from '../utils/statistics.utils';
import { graphCollectionTransformer } from '../transformers/statistics-graphCollection.transformer';

export default class StatisticsService {
  /**
   * Creates the graph metadata in the database, retrieve the graph data using getGraphData function
   *
   * @param user The user creating the graph, must have CREATE_GRAPH permission
   * @param startDate The start date of when to consider the data
   * @param endDate The end date of when to consider the data
   * @param title The title of the graph
   * @param graphType The type of graph to use
   * @param measure The measurement to apply to the data
   * @param graphDisplayType The way to display the graph
   * @param organization The organization to make the graph under
   * @param carIds Array of carIds to segment the data by, if none are supplied will show data for all cars
   * @param specialPermissions Array of permissions to apply to this graph
   * @param graphcollectionId optional graph collection to add the graph to
   * @returns The created graph and its data
   */
  static async createGraph(
    user: User,
    title: string,
    graphType: Graph_Type,
    measure: Measure,
    graphDisplayType: Graph_Display_Type,
    organization: Organization,
    carIds: string[],
    specialPermissions: Special_Permission[],
    startDate?: Date,
    endDate?: Date,
    graphCollectionId?: string
  ): Promise<Graph> {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, [Permission.CREATE_GRAPH]))) {
      throw new AccessDeniedException('You do not have permission to create a graph');
    }

    if (startDate && endDate) {
      if (startDate.getTime() >= endDate.getTime()) {
        throw new HttpException(400, 'End date must be after start date');
      }
    }

    if (!isUnderWordCount(title, 20)) {
      throw new HttpException(400, 'Title must be less than 20 words');
    }

    if (carIds.length > 0) {
      await Promise.all(
        carIds.map(async (carId) => {
          const car = await prisma.car.findUnique({
            where: { carId, wbsElement: { organizationId: organization.organizationId } },
            include: {
              wbsElement: true
            }
          });

          if (!car) {
            throw new NotFoundException('Car', carId);
          }
          if (car.wbsElement.dateDeleted) throw new DeletedException('Car', carId);
        })
      );
    }

    if (graphCollectionId) {
      const graphCollection = await prisma.graph_Collection.findUnique({ where: { id: graphCollectionId } });

      if (!graphCollection) {
        throw new NotFoundException('Graph Collection', graphCollectionId);
      }
      if (graphCollection.dateDeleted) {
        throw new DeletedException('Graph Collection', graphCollectionId);
      }
      if (graphCollection.organizationId !== organization.organizationId) {
        throw new InvalidOrganizationException('Graph Collection');
      }
    }

    const graph = await prisma.graph.create({
      data: {
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        title,
        graphType,
        measure,
        displayGraphType: graphDisplayType,
        graphCollectionId: graphCollectionId ?? null,
        userCreatedId: user.userId,
        cars: {
          connect: carIds.map((carId) => {
            return { carId };
          })
        },
        organizationId: organization.organizationId,
        specialPermissions
      },
      ...getGraphQueryArgs(organization.organizationId)
    });

    return graphTransformer({
      ...graph,
      graphData: await getGraphData(graphType, measure, organization.organizationId, startDate ?? null, endDate ?? null, {
        carIds
      })
    });
  }

  /**
   * Edits the graph metadata in the database, retrieve the graph data using getGraphData function
   *
   * Note: the `userCreatedId` and `organizationId` are not editable.
   *
   * @param userEditing The user editing the graph, must be the user who created the graph
   * @param graphId The id of the graph to edit
   * @param startDate The start date of when to consider the data
   * @param endDate The end date of when to consider the data
   * @param title The title of the graph
   * @param graphType The type of graph to use
   * @param measure The measurement to apply to the data
   * @param graphDisplayType The way to display the graph
   * @param organization The organization to make the graph under
   * @param carIds Array of carIds to segment the data by, if none are supplied will show data for all cars
   * @param specialPermissions Array of permissions to apply to this graph
   * @param organization The organization the graph belongs to
   * @returns The edited graph and its data
   */
  static async editGraph(
    userEditing: User,
    graphId: string,
    title: string,
    graphType: Graph_Type,
    measure: Measure,
    graphDisplayType: Graph_Display_Type,
    organization: Organization,
    carIds: string[],
    specialPermissions: Special_Permission[],
    startDate?: Date,
    endDate?: Date,
    graphCollectionId?: string
  ): Promise<Graph> {
    if (!(await userHasPermissionNew(userEditing.userId, organization.organizationId, [Permission.EDIT_GRAPH]))) {
      throw new AccessDeniedException('You do not have permission to edit a graph');
    }

    const graph = await prisma.graph.findUnique({
      where: {
        id: graphId
      },
      ...getGraphQueryArgs(organization.organizationId)
    });

    if (!graph) {
      throw new NotFoundException('Graph', graphId);
    }
    if (graph.dateDeleted) {
      throw new DeletedException('Graph', graphId);
    }
    if (graph.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Graph');
    }

    if (startDate && endDate) {
      if (startDate.getTime() >= endDate.getTime()) {
        throw new HttpException(400, 'End date must be after start date');
      }
    }

    if (!isUnderWordCount(title, 20)) {
      throw new HttpException(400, 'Title must be less than 20 words');
    }

    if (graphCollectionId) {
      const graphCollection = await prisma.graph_Collection.findUnique({ where: { id: graphCollectionId } });

      if (!graphCollection) {
        throw new NotFoundException('Graph Collection', graphCollectionId);
      }
      if (graphCollection.dateDeleted) {
        throw new DeletedException('Graph Collection', graphCollectionId);
      }
      if (graphCollection.organizationId !== organization.organizationId) {
        throw new InvalidOrganizationException('Graph Collection');
      }
    }

    const updatedGraph = await prisma.graph.update({
      where: {
        id: graphId
      },
      data: {
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        title,
        graphType,
        measure,
        displayGraphType: graphDisplayType,
        specialPermissions,
        cars: {
          connect: carIds.map((carId) => {
            return { carId };
          })
        },
        graphCollectionId: graphCollectionId ? graphCollectionId : null
      },
      ...getGraphQueryArgs(organization.organizationId)
    });

    return graphTransformer({
      ...updatedGraph,
      graphData: await getGraphData(
        updatedGraph.graphType,
        updatedGraph.measure,
        updatedGraph.organizationId,
        updatedGraph.startDate,
        updatedGraph.endDate,
        { carIds: updatedGraph.cars.map((car) => car.carId) }
      )
    });
  }

  /**
   * Gets a single graph
   *
   * @param id The string identifier of the graph to get
   * @param user The user retrieving the graph, must have VIEW_GRAPH permission
   * @param organization The organization to retrieve the graph from
   * @returns The requested graph and its data
   * @throws if the graph is not found or the graph is deleted
   */
  static async getSingleGraph(id: string, user: User, organization: Organization): Promise<Graph> {
    const requestedGraph = await prisma.graph.findUnique({
      where: { id, organizationId: organization.organizationId },
      ...getGraphQueryArgs(organization.organizationId)
    });

    if (!requestedGraph) throw new NotFoundException('Graph', id);
    if (requestedGraph.dateDeleted) throw new DeletedException('Graph', id);
    if (requestedGraph.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Graph');
    if (
      !(await userHasPermissionNew(
        user.userId,
        organization.organizationId,
        ['VIEW_GRAPH'].concat(requestedGraph.specialPermissions)
      ))
    ) {
      throw new AccessDeniedException('You do not have permission to view graphs');
    }

    return graphTransformer({
      ...requestedGraph,
      graphData: await getGraphData(
        requestedGraph.graphType,
        requestedGraph.measure,
        organization.organizationId,
        requestedGraph.startDate,
        requestedGraph.endDate,
        { carIds: requestedGraph.cars.map((car) => car.carId) }
      )
    });
  }

  /**
   * Get all graph collections.
   * @param organization organization that the user is in.
   * @returns all the graph collections.
   */
  static async getAllGraphCollections(organization: Organization): Promise<GraphCollection[]> {
    const graphCollections = await prisma.graph_Collection.findMany({
      where: {
        dateDeleted: null,
        organizationId: organization.organizationId
      },
      ...getGraphCollectionQueryArgs(organization.organizationId)
    });

    return Promise.all(
      graphCollections.map(async (graphCollection) => {
        const addedDataGraphs: (Prisma.GraphGetPayload<GraphQueryArgs> & { graphData: GraphData[] })[] = await Promise.all(
          graphCollection.graphs.map(async (graph) => ({
            ...graph,
            graphData: await getGraphData(
              graph.graphType,
              graph.measure,
              organization.organizationId,
              graph.startDate ?? null,
              graph.endDate ?? null,
              {
                carIds: graph.cars.map((car) => {
                  return car.carId;
                })
              }
            )
          }))
        );

        return graphCollectionTransformer(graphCollection, addedDataGraphs);
      })
    );
  }
}
