import { Organization, User, Graph_Type, Measure } from '@prisma/client';
import { Graph, GraphData, GraphGen, QueryPath } from 'shared';
import prisma from '../prisma/prisma';
import graphTransformer from '../transformers/statistics-graph.transformer';
import { getGraphQueryArgs } from '../prisma-query-args/statistics.query-args';
import { userHasPermissionNew } from '../utils/users.utils';
import { AccessDeniedException, HttpException } from '../utils/errors.utils';
import { Sql } from '@prisma/client/runtime/library';

export default class StatisticsService {
  /**
   * Creates the graph metadata in the database, retrieve the graph data using getGraphData function
   *
   * @param user The user creating the graph, must have CREATE_GRAPH permission
   * @param startDate The start date of when to consider the data
   * @param endDate The end date of when to consider the data
   * @param title The title of the graph
   * @param graphType The type of graph
   * @param measure The measurement to apply to the data
   * @param graphGen The metadata for how to acquire the data, leads a recursive path of sql
   * @param organization The organization to make the graph under
   * @returns The created graph and its data
   */
  static async createGraph(
    user: User,
    startDate: Date,
    endDate: Date,
    title: string,
    graphType: Graph_Type,
    measure: Measure,
    graphGen: GraphGen,
    organization: Organization,
    graphCollectionId?: string
  ): Promise<Graph> {
    if (!(await userHasPermissionNew(user.userId, organization.organizationId, ['CREATE_GRAPH']))) {
      throw new AccessDeniedException('You do not have permission to create a graph');
    }

    if (startDate.getTime() >= endDate.getTime()) {
      throw new HttpException(400, 'End date must be after start date');
    }

    const graph = await prisma.graph.create({
      data: {
        startDate,
        endDate,
        title,
        graphType,
        measure,
        finalTable: graphGen.finalTable,
        finalColumn: graphGen.finalColumn,
        groupByColumn: graphGen.groupByColumn,
        graphCollectionId: graphCollectionId ? graphCollectionId : null,
        userCreatedId: user.userId,
        organizationId: organization.organizationId
      },
      ...getGraphQueryArgs(organization.organizationId)
    });

    let currGenPath: QueryPath | undefined = graphGen.queryPath;
    while (currGenPath !== undefined) {
      await prisma.graph_Query.create({
        data: {
          table: currGenPath.table,
          primaryKey: currGenPath.primaryKey,
          graph: {
            connect: {
              id: graph.id
            }
          }
        }
      });

      currGenPath = currGenPath.next;
    }

    return graphTransformer({ ...graph, graphData: await StatisticsService.getGraphData(graphGen, measure) });
  }

  // TODO IN NEW TICKET: Add Support for Line graphs over time. Currently this only works for grouping one data point by another. Specifically with sum and average
  static async getGraphData(graphGen: GraphGen, measure: Measure): Promise<GraphData[]> {
    // POC QUERY EXAMPLE:
    // SELECT SUM(p.budget) AS total_budget
    // FROM Division d
    // JOIN Team t ON d.id = t.division_id
    // JOIN TeamProject tp ON t.id = tp.team_id
    // JOIN Project p ON tp.project_id = p.id
    // GROUP BY d.name;
    // POSSIBLE QUERY CALCULATION:
    const finalSelection = `${graphGen.queryPath.table.toLowerCase()}."${
      graphGen.groupByColumn
    }", ${measure}(${graphGen.finalTable.toLowerCase()}.${graphGen.finalColumn})`;

    let query =
      `SELECT ` + finalSelection + ` FROM "${graphGen.queryPath.table}" ${graphGen.queryPath.table.toLowerCase()} `;
    let currPath = graphGen.queryPath;
    let prev = currPath;
    while (currPath.next !== undefined) {
      prev = currPath;
      currPath = currPath.next;
      const tableName = currPath.table;
      const tableVar = currPath.table.toLowerCase();
      const parentTableVar = prev.table.toLowerCase();
      const parentPrimaryKey = prev.primaryKey;
      query += `JOIN "${tableName}" ${tableVar} ON ${parentTableVar}."${parentPrimaryKey}" = ${tableVar}."${currPath.parentForeignKey}" `;
    }
    query += `GROUP BY ${graphGen.queryPath.table.toLowerCase()}."${graphGen.groupByColumn}"`;

    const data: any[] = await prisma.$queryRaw(new Sql([query], []));

    return data.map((value) => {
      return {
        value: parseFloat(value[measure.toLowerCase()].toString()),
        label: value[graphGen.groupByColumn]
      };
    });
  }
}
