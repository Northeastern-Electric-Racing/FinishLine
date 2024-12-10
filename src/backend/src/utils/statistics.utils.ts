import { FlattenedRelations, SimpleForeignRelation, TableColumn } from 'shared';
import prisma from '../prisma/prisma';
import { Sql } from '@prisma/client/runtime/library';

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

export const getSchemaDetails = async () => {
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
};

export const buildTree = (
  tables: string[],
  foreignKeys: ForeignKey[],
  junctionTables: JunctionTable[],
  tableColumns: Record<string, TableColumn[]>
): Relation[] => {
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
};

export const getFlattenedTree = (tree: Relation[]): FlattenedRelations[] => {
  const flattenRelations = (obj: Relation): FlattenedRelations => {
    const seenRelations = new Map<string, SimpleForeignRelation>();
    obj.relationships.forEach((relation) => {
      seenRelations.set(relation.foreignKey + relation.table.table, {
        foreignKey: relation.foreignKey,
        table: relation.table.table,
        primaryKey: relation.table.primaryKey ?? relation.foreignKey
      });
    });

    seenRelations.delete(obj.table);

    return { ...obj, relationships: Array.from(seenRelations.values()) };
  };

  return tree.map((root) => flattenRelations(root));
};
