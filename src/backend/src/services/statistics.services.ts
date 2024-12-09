import { Organization, User, Graph_Type, Measure } from '@prisma/client';
import { FlattenedRelations, Graph, GraphData, GraphGen, QueryPath, SimpleForeignRelation } from 'shared';
import prisma from '../prisma/prisma';
import graphTransformer from '../transformers/statistics-graph.transformer';
import { getGraphQueryArgs } from '../prisma-query-args/statistics.query-args';
import { userHasPermissionNew } from '../utils/users.utils';
import { AccessDeniedException, HttpException } from '../utils/errors.utils';
import { Sql } from '@prisma/client/runtime/library';
import { TableColumn } from 'shared';
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

    // Validate we can actually get the graph data first
    const graphData = await StatisticsService.getGraphData(graphGen, measure);

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

    return graphTransformer({ ...graph, graphData });
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

    console.log('graph gen: ', graphGen);

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

  static async getGraphConfig(): Promise<FlattenedRelations[]> {
    const { tables, foreignKeys, junctionTables, tableColumns } = await getSchemaDetails();

    const tree = buildTree(tables, foreignKeys, junctionTables, tableColumns);

    const flat = getFlattenedTree(tree);
    return flat;
  }
}

type ForeignKey = {
  childtable: string;
  childforeignkey: string;
  parenttable: string;
};

type ManyToManyRelation = {
  table: string;
  tablePrimaryKey: string;
  junctionForeignKey: string;
};

type JunctionTable = {
  junctionTable: string;
  parentTables: ManyToManyRelation[];
};

type ForeignRelation = {
  foreignKey: string;
  table: Relation;
};

type Relation = {
  table: string;
  primaryKey: string | undefined;
  columns: TableColumn[];
  relationships: ForeignRelation[];
};

async function getSchemaDetails() {
  // Get all tables
  const tables: string[] = await prisma
    .$queryRaw<Array<{ table_name: string }>>(
      new Sql(
        [
          `SELECT table_name::TEXT 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name != '_prisma_migrations';`
        ],
        []
      )
    )
    .then((results) => results.map((row) => row.table_name));

  // Get foreign key relationships
  const foreignKeys: ForeignKey[] = await prisma.$queryRaw<Array<ForeignKey>>(
    new Sql(
      [
        `SELECT
            kcu.table_name::TEXT AS childTable,
            ccu.table_name::TEXT AS parentTable,
            kcu.column_name::TEXT AS childForeignKey,
            ccu.column_name::TEXT AS parentPrimaryKey
        FROM 
            information_schema.table_constraints AS tc
        JOIN 
            information_schema.key_column_usage AS kcu
        ON 
            tc.constraint_name = kcu.constraint_name
        JOIN 
            information_schema.constraint_column_usage AS ccu
        ON 
            ccu.constraint_name = tc.constraint_name
        WHERE 
            tc.constraint_type = 'FOREIGN KEY';`
      ],
      []
    )
  );

  const junctionTableMappings = await prisma.$queryRaw<
    Array<{
      junction_table: string;
      parent_table: string;
      junction_table_foreign_key: string;
      parent_primary_key: string;
    }>
  >(
    new Sql(
      [
        `SELECT
          jt.table_name::TEXT AS junction_table,
          ccu.table_name::TEXT AS parent_table,
          ccu.column_name::TEXT AS parent_primary_key,
          kcu.column_name::TEXT AS junction_table_foreign_key
        FROM 
            information_schema.tables jt
        JOIN 
            information_schema.table_constraints AS tc
        ON 
            jt.table_name = tc.table_name
        JOIN 
            information_schema.key_column_usage AS kcu
        ON 
            tc.constraint_name = kcu.constraint_name
        JOIN 
            information_schema.constraint_column_usage AS ccu
        ON 
            ccu.constraint_name = tc.constraint_name
        WHERE 
            jt.table_type = 'BASE TABLE'
            AND jt.table_schema = 'public'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND jt.table_name IN (
                SELECT t.table_name
                FROM information_schema.table_constraints AS tc2
                JOIN information_schema.key_column_usage AS kcu2
                ON tc2.constraint_name = kcu2.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu2
                ON ccu2.constraint_name = tc2.constraint_name
                JOIN information_schema.tables t
                ON tc2.table_name = t.table_name
                WHERE tc2.constraint_type = 'FOREIGN KEY'
                GROUP BY t.table_name
                HAVING COUNT(DISTINCT ccu2.table_name) = 2
            );`
      ],
      []
    )
  );

  const junctionTables = junctionTableMappings.reduce((prev, curr) => {
    const existingJunction = prev.get(curr.junction_table);
    if (existingJunction) {
      prev.set(curr.junction_table, {
        ...existingJunction,
        parentTables: existingJunction.parentTables.concat({
          table: curr.parent_table,
          junctionForeignKey: curr.junction_table_foreign_key,
          tablePrimaryKey: curr.parent_primary_key
        })
      });
    } else {
      prev.set(curr.junction_table, {
        junctionTable: curr.junction_table,
        parentTables: [
          {
            table: curr.parent_table,
            junctionForeignKey: curr.junction_table_foreign_key,
            tablePrimaryKey: curr.parent_primary_key
          }
        ]
      });
    }

    return prev;
  }, new Map<string, JunctionTable>());

  const tableColumns: Record<string, TableColumn[]> = {};
  for (const table of tables) {
    const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string; is_primary_key: boolean }>>(
      new Sql(
        [
          `SELECT 
              c.column_name::TEXT AS column_name,
              c.data_type::TEXT AS data_type,
              CASE 
                  WHEN kcu.column_name IS NOT NULL THEN TRUE 
                  ELSE FALSE 
              END AS is_primary_key
          FROM 
              information_schema.columns c
          LEFT JOIN 
              information_schema.key_column_usage kcu
          ON 
              c.table_name = kcu.table_name 
              AND c.column_name = kcu.column_name
              AND kcu.constraint_name IN (
                  SELECT constraint_name
                  FROM information_schema.table_constraints
                  WHERE table_name = '${table}' 
                  AND constraint_type = 'PRIMARY KEY'
              )
          WHERE 
              c.table_name = '${table}';`
        ],
        []
      )
    );
    tableColumns[table] = columns.map((col) => ({
      columnName: col.column_name,
      isPrimaryKey: col.is_primary_key,
      dataType: col.data_type
    }));
  }

  return { tables, foreignKeys, junctionTables: Array.from(junctionTables.values()), tableColumns };
}

function buildTree(
  tables: string[],
  foreignKeys: ForeignKey[],
  junctionTables: JunctionTable[],
  tableColumns: Record<string, TableColumn[]>
): Relation[] {
  const tree: Record<string, Relation> = {};

  // Initialize tree nodes
  tables.forEach((table) => {
    const primaryKey = tableColumns[table].find((col) => col.isPrimaryKey)?.columnName;
    tree[table] = {
      table,
      columns: tableColumns[table],
      primaryKey,
      relationships: []
    };
  });

  // Add one-to-many relationships
  foreignKeys.forEach(({ childtable, childforeignkey, parenttable }) => {
    if (tree[parenttable] && tree[childtable]) {
      tree[childtable].relationships.push({ foreignKey: childforeignkey, table: tree[parenttable] });
    }
  });

  // Add many-to-many relationships
  junctionTables.forEach(({ junctionTable, parentTables }) => {
    const [table1, table2] = parentTables;
    if (tree[table1.table] && tree[table2.table]) {
      tree[table1.table].relationships.push({ table: tree[junctionTable], foreignKey: table1.tablePrimaryKey });
      tree[table2.table].relationships.push({ table: tree[junctionTable], foreignKey: table2.tablePrimaryKey });
      tree[junctionTable].relationships.push(
        { table: tree[table1.table], foreignKey: table1.junctionForeignKey },
        { table: tree[table2.table], foreignKey: table2.junctionForeignKey }
      );
    }
  });

  // Return the tree as an array of root nodes
  return Object.values(tree);
}

function getFlattenedTree(tree: Relation[]): FlattenedRelations[] {
  const flattenRelations = (obj: Relation): FlattenedRelations => {
    const seenRelations = new Map<string, SimpleForeignRelation>();

    obj.relationships.forEach((relation) => {
      seenRelations.set(relation.foreignKey, {
        foreignKey: relation.foreignKey,
        table: relation.table.table,
        primaryKey: relation.table.primaryKey ?? relation.foreignKey
      });
    });

    seenRelations.delete(obj.table);

    return { ...obj, relationships: Array.from(seenRelations.values()) };
  };

  return tree.map((root) => flattenRelations(root));
}
