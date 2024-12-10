import {
  ColumnConfig,
  CreateGraphArgs,
  FlattenedRelations,
  GraphCollection,
  QueryPath,
  SimpleForeignRelation,
  TrackedFlattenedRelations,
  ValidatedGraphFormInput
} from 'shared';

export const graphCollectionToAutoCompleteValue = (collection: GraphCollection): { label: string; id: string } => {
  return {
    label: collection.title,
    id: collection.id
  };
};

export const trackedTableToAutoCompleteValue = (relation: TrackedFlattenedRelations): { label: string; id: string } => {
  return {
    label: relation.path.map(getRelationKey).join(' -> '),
    id: JSON.stringify(relation)
  };
};

export const tableToAutoCompleteValue = (table: FlattenedRelations): { label: string; id: string } => {
  return { label: table.table, id: table.table };
};

export const tableToColumnAutoCompleteValue = (column: ColumnConfig): { label: string; id: string } => {
  return { label: column.columnName, id: column.columnName };
};

const getQueryPathForSimpleForeignRelations = (foreignRelations: SimpleForeignRelation[]): QueryPath | undefined => {
  console.log(JSON.stringify(foreignRelations));
  if (foreignRelations.length === 0) return;

  const first = foreignRelations.shift()!;

  const init: QueryPath = {
    table: first.table,
    primaryKey: first.primaryKey
  };

  let prev = init;

  while (foreignRelations.length > 0) {
    const next = foreignRelations.shift()!;
    prev.next = {
      table: next.table,
      parentForeignKey: next.foreignKey,
      primaryKey: next.primaryKey
    };
    prev = prev.next;
  }

  console.log(JSON.stringify(init));

  return init;
};

export const transformGraphFormInputToCreateGraphArgs = (input: ValidatedGraphFormInput): CreateGraphArgs => {
  const queryPath = getQueryPathForSimpleForeignRelations(input.xData.path);

  if (!queryPath) {
    throw new Error('Could not transform path to queryPath');
  }

  return {
    title: input.title,
    startDate: input.startTime,
    endDate: input.endTime,
    graphType: input.graphType,
    measure: input.measure,
    graphGen: {
      finalTable: input.yData.table,
      finalColumn: input.yData.column,
      groupByColumn: input.xData.column,
      queryPath
    }
  };
};

export const getRelationKey = (relation: { table: string; foreignKey: string }) => {
  return `${relation.table} (${relation.foreignKey})`;
};
