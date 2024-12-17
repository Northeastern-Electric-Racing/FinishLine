import { Organization, User, Graph_Type, Measure, Graph_Display_Type } from '@prisma/client';
import prisma from '../prisma/prisma';
import { DeletedException, InvalidOrganizationException, NotFoundException } from '../utils/errors.utils';
import graphTransformer from '../transformers/statistics-graph.transformer';
import { getGraphQueryArgs } from '../prisma-query-args/statistics.query-args';
import { userHasPermissionNew } from '../utils/users.utils';
import { AccessDeniedException, HttpException } from '../utils/errors.utils';
import { Graph, GraphData } from 'shared';
import {
  getGraphDataForChangeRequestsByDivision,
  getGraphDataForChangeRequestsByProject,
  getGraphDataForChangeRequestsByTeam,
  getGraphDataForProjectBudgetByDivision,
  getGraphDataForProjectBudgetByProject,
  getGraphDataForProjectBudgetByTeam,
  getGraphDataForReimbursementRequestsByDivision,
  getGraphDataForReimbursementRequestsByProject,
  getGraphDataForReimbursementRequestsByTeam
} from '../utils/statistics.utils';

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
   * @param carId Optional id of the car to segment the data by
   * @param graphcollectionId optional graph collection to add the graph to
   * @returns The created graph and its data
   */
  static async createGraph(
    user: User,
    startDate: Date,
    endDate: Date,
    title: string,
    graphType: Graph_Type,
    measure: Measure,
    graphDisplayType: Graph_Display_Type,
    organization: Organization,
    carId?: string,
    graphCollectionId?: string
  ): Promise<Graph> {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, ['CREATE_GRAPH']))) {
      throw new AccessDeniedException('You do not have permission to create a graph');
    }

    if (startDate.getTime() >= endDate.getTime()) {
      throw new HttpException(400, 'End date must be after start date');
    }

    if (carId) {
      const car = await prisma.car.findUnique({
        where: { carId }
      });

      if (!car) {
        throw new NotFoundException('Car', carId);
      }
    }

    const graph = await prisma.graph.create({
      data: {
        startDate,
        endDate,
        title,
        graphType,
        measure,
        displayGraphType: graphDisplayType,
        graphCollectionId: graphCollectionId ?? null,
        userCreatedId: user.userId,
        carId,
        organizationId: organization.organizationId
      },
      ...getGraphQueryArgs(organization.organizationId)
    });

    return graphTransformer({
      ...graph,
      graphData: await StatisticsService.getGraphData(graphType, measure, organization.organizationId, { carId })
    });
  }

  /**
   *
   * @param graphType
   * @param measure
   * @param organizationId
   * @param params
   * @returns
   */
  static async getGraphData(
    graphType: Graph_Type,
    measure: Measure,
    organizationId: string,
    params: { carId?: string }
  ): Promise<GraphData[]> {
    switch (graphType) {
      case Graph_Type.PROJECT_BUDGET_BY_PROJECT:
        return getGraphDataForProjectBudgetByProject(measure, organizationId, params);
      case Graph_Type.PROJECT_BUDGET_BY_TEAM:
        return getGraphDataForProjectBudgetByTeam(measure, organizationId, params);
      case Graph_Type.PROJECT_BUDGET_BY_DIVISION:
        return getGraphDataForProjectBudgetByDivision(measure, organizationId, params);
      case Graph_Type.CHANGE_REQUESTS_BY_PROJECT:
        return getGraphDataForChangeRequestsByProject(measure, organizationId, params);
      case Graph_Type.CHANGE_REQUESTS_BY_TEAM:
        return getGraphDataForChangeRequestsByTeam(measure, organizationId, params);
      case Graph_Type.CHANGE_REQUESTS_BY_DIVISION:
        return getGraphDataForChangeRequestsByDivision(measure, organizationId, params);
      case Graph_Type.REIMBURSEMENT_TOTAL_BY_PROJECT:
        return getGraphDataForReimbursementRequestsByProject(measure, organizationId, params);
      case Graph_Type.REIMBURSEMENT_TOTAL_BY_TEAM:
        return getGraphDataForReimbursementRequestsByTeam(measure, organizationId, params);
      case Graph_Type.REIMBURSEMENT_TOTAL_BY_DIVISION:
        return getGraphDataForReimbursementRequestsByDivision(measure, organizationId, params);
    }
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
      graphData: await StatisticsService.getGraphData(
        requestedGraph.graphType,
        requestedGraph.measure,
        organization.organizationId,
        { carId: requestedGraph.carId ?? undefined }
      )
    });
  }

  /**
   * Gets graph config used to generate graphs with
   *
   * @returns The flattened relations for the database
   */
  static async getGraphConfig(): Promise<FlattenedRelations[]> {
    const { tables, foreignKeys, junctionTables, tableColumns } = await getSchemaDetails();

    const tree = buildTree(tables, foreignKeys, junctionTables, tableColumns);

    const flat = getFlattenedTree(tree);
    return flat;
  }
}
