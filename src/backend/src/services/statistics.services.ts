import { Organization, User, Graph_Type, Measure, Graph_Display_Type, Special_Permission, Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';
import { DeletedException, InvalidOrganizationException, NotFoundException } from '../utils/errors.utils';
import graphTransformer from '../transformers/statistics-graph.transformer';
import { getGraphQueryArgs, getGraphCollectionQueryArgs, GraphQueryArgs } from '../prisma-query-args/statistics.query-args';
import { userHasPermissionNew } from '../utils/users.utils';
import { AccessDeniedException, HttpException } from '../utils/errors.utils';
import { Graph, GraphCollection, GraphData, isSubset, isUnderWordCount, Permission } from 'shared';
import { getGraphCollectionAndVerifyPermissions, getGraphData } from '../utils/statistics.utils';
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
      !(await userHasPermissionNew(user.userId, organization.organizationId, [
        ...requestedGraph.specialPermissions,
        Permission.VIEW_GRAPH
      ]))
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
   * @param user The user trying to get the graph collections
   * @param organization organization that the user is in.
   * @returns all the graph collections.
   */
  static async getAllGraphCollections(user: User, organization: Organization): Promise<GraphCollection[]> {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, [Permission.VIEW_GRAPH_COLLECTION]))) {
      throw new AccessDeniedException('You do not have permission to view graph collections');
    }

    let graphCollections = await prisma.graph_Collection.findMany({
      where: {
        dateDeleted: null,
        organizationId: organization.organizationId
      },
      ...getGraphCollectionQueryArgs(organization.organizationId)
    });

    // Prisma does not support the kind of filtering we need natively, so do it after the query based on permissions
    graphCollections = graphCollections.filter((graphCollection) =>
      isSubset(graphCollection.viewPermissions, user.additionalPermissions)
    );

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

  /**
   * Creates a graph collection in the database
   *
   * @param user The user who is creating the graph collection
   * @param title The title of the graph collection that is being created
   * @param specialPermissions Any special permissions related to the graph collection
   * @param organization The organization the collection is in
   * @returns The created graph collection
   */
  static async createGraphCollection(
    user: User,
    title: string,
    specialPermissions: Special_Permission[],
    organization: Organization
  ) {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, [Permission.CREATE_GRAPH_COLLECTION]))) {
      throw new AccessDeniedException('You do not have permission to create graph collections');
    }

    if (!isUnderWordCount(title, 20)) {
      throw new HttpException(400, 'Title must be less than 20 words');
    }

    const graphCollection = await prisma.graph_Collection.create({
      data: {
        organizationId: organization.organizationId,
        title,
        viewPermissions: specialPermissions,
        userCreatedId: user.userId
      },
      ...getGraphCollectionQueryArgs(organization.organizationId)
    });

    return graphCollectionTransformer(
      graphCollection,
      await Promise.all(
        graphCollection.graphs.map(async (graph) => {
          return {
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
          };
        })
      )
    );
  }

  static async getSingleGraphCollection(user: User, graphCollectionId: string, organization: Organization) {
    const requestedGraphCollection = await getGraphCollectionAndVerifyPermissions(user, graphCollectionId, organization);

    return graphCollectionTransformer(
      requestedGraphCollection,
      await Promise.all(
        requestedGraphCollection.graphs.map(async (graph) => {
          return {
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
          };
        })
      )
    );
  }

  /**
   * Edits the given graph collection with the updated values
   *
   * @param user The user who is editing the graph collection
   * @param graphCollectionId The id of the collection that is being edited
   * @param title The new title of the collection
   * @param specialPermission The new permissions of the collection
   * @param organization The organization that the user is currently in
   * @returns The updated Graph collection
   */
  static async editGraphCollection(
    user: User,
    graphCollectionId: string,
    title: string,
    specialPermission: Special_Permission[],
    organization: Organization
  ) {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, [Permission.EDIT_GRAPH_COLLECTION]))) {
      throw new AccessDeniedException('You do not have permission to edit graph collections');
    }

    if (!isUnderWordCount(title, 20)) {
      throw new HttpException(400, 'Title must be less than 20 words');
    }

    const graphCollection = await getGraphCollectionAndVerifyPermissions(user, graphCollectionId, organization);

    const updatedCollection = await prisma.graph_Collection.update({
      where: {
        id: graphCollection.id
      },
      data: {
        viewPermissions: specialPermission,
        title
      },
      ...getGraphCollectionQueryArgs(organization.organizationId)
    });

    return graphCollectionTransformer(
      updatedCollection,
      await Promise.all(
        updatedCollection.graphs.map(async (graph) => {
          return {
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
          };
        })
      )
    );
  }

  /**
   * Removes a graph from the given graph collection
   *
   * @param user The user who is removing the graph
   * @param graphCollectionId The collection that the graph will be removed from
   * @param graphId The graph that is being removed
   * @param organization The organization the user is currently in
   */
  static async removeGraphFromCollection(
    user: User,
    graphCollectionId: string,
    graphId: string,
    organization: Organization
  ): Promise<{ message: string }> {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, [Permission.EDIT_GRAPH_COLLECTION]))) {
      throw new AccessDeniedException('You do not have permission to edit graph collections');
    }

    const graph = await prisma.graph.findUnique({
      where: { id: graphId, organizationId: organization.organizationId }
    });

    if (!graph) {
      throw new NotFoundException('Graph', graphId);
    }
    if (graph.dateDeleted) {
      throw new DeletedException('Graph', graphId);
    }

    const collection = await prisma.graph_Collection.findUnique({
      where: { id: graphCollectionId, organizationId: organization.organizationId }
    });

    if (!collection) {
      throw new NotFoundException('Graph Collection', graphCollectionId);
    }
    if (collection.dateDeleted) {
      throw new DeletedException('Graph Collection', graphCollectionId);
    }

    console.log('test');

    await prisma.graph.update({
      where: { id: graphId },
      data: {
        graphCollectionId: null
      },
      ...getGraphQueryArgs(organization.organizationId)
    });

    return { message: 'Graph unlinked' };
  }

  /**
   * Deletes a graph collection
   *
   * @param user The user who is deleting the graph collection
   * @param graphCollectionId The collection to be deleted
   * @param organization The organization the user is currently in
   */
  static async deleteGraphCollection(
    user: User,
    graphCollectionId: string,
    organization: Organization
  ): Promise<{ message: string }> {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, [Permission.DELETE_GRAPH_COLLECTION]))) {
      throw new AccessDeniedException('You do not have permission to edit graph collections');
    }

    const collection = await prisma.graph_Collection.findUnique({
      where: { id: graphCollectionId, organizationId: organization.organizationId }
    });

    if (!collection) {
      throw new NotFoundException('Graph Collection', graphCollectionId);
    }
    if (collection.dateDeleted) {
      throw new DeletedException('Graph Collection', graphCollectionId);
    }

    await prisma.graph_Collection.update({
      where: { id: graphCollectionId },
      data: {
        dateDeleted: new Date(),
        userDeleted: {
          connect: {
            userId: user.userId
          }
        }
      }
    });

    return { message: 'Graph Deleted' };
  }
}
