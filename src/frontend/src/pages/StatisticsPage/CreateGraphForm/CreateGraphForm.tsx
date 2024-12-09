import { FormControl, FormHelperText, FormLabel, Grid, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ColumnConfig,
  CreateGraphArgs,
  FlattenedRelations,
  GraphType,
  Measure,
  QueryPath,
  SimpleForeignRelation,
  TrackedFlattenedRelations
} from 'shared';
import NERAutocomplete from '../../../components/NERAutocomplete';
import ReactHookTextField from '../../../components/ReactHookTextField';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useHistory } from 'react-router-dom';
import { useCreateGraph } from '../../../hooks/statistics.hooks';
import { routes } from '../../../utils/routes';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { DatePicker } from '@mui/x-date-pickers';
import { displayEnum } from '../../../utils/pipes';

export interface GraphFormInput {
  title: string;
  yData: {
    column: string;
    table: string;
  };
  xData: {
    column: string;
    table: string;
    path: SimpleForeignRelation[];
  };
  measure: Measure;
  graphType: GraphType;
  startTime: Date | null;
  endTime: Date | null;
}

const trackedTableToAutoCompleteValue = (relation: TrackedFlattenedRelations): { label: string; id: string } => {
  return {
    label: relation.path
      .filter((relation) => !relation.table.startsWith('_'))
      .map((relation) => relation.table)
      .join('->'),
    id: relation.table
  };
};

const tableToAutoCompleteValue = (table: FlattenedRelations): { label: string; id: string } => {
  return { label: table.table, id: table.table };
};

const tableToColumnAutoCompleteValue = (column: ColumnConfig): { label: string; id: string } => {
  return { label: column.columnName, id: column.columnName };
};

const defaultValues: GraphFormInput = {
  yData: {
    column: '',
    table: ''
  },
  xData: {
    column: '',
    table: '',
    path: []
  },
  measure: Measure.SUM,
  startTime: null,
  endTime: null,
  title: '',
  graphType: GraphType.BAR
};

interface CreateGraphFormProps {
  data: FlattenedRelations[];
}

interface ValidatedGraphFormInput {
  title: string;
  yData: {
    column: string;
    table: string;
  };
  xData: {
    column: string;
    table: string;
    path: SimpleForeignRelation[];
  };
  measure: Measure;
  startTime: Date;
  endTime: Date;
  graphType: GraphType;
}

const getQueryPathForSimpleForeignRelations = (foreignRelations: SimpleForeignRelation[]): QueryPath | undefined => {
  console.log(foreignRelations);
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

  return init;
};

const transformGraphFormInputToCreateGraphArgs = (input: ValidatedGraphFormInput): CreateGraphArgs => {
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

const schema = yup.object().shape({
  endTime: yup.date().required(),
  startTime: yup.date().required(),
  title: yup.string().required(),
  graphType: yup.string().required(),
  measure: yup.string().required()
});

const CreateGraphForm: React.FC<CreateGraphFormProps> = ({ data }) => {
  const [yTables, setYTables] = useState(new Map<string, FlattenedRelations>());
  const [xTables, setXTables] = useState(new Map<string, TrackedFlattenedRelations>());
  const [yTable, setYTable] = useState<string | null>(null);
  const history = useHistory();
  const toast = useToast();
  const { mutateAsync, isLoading } = useCreateGraph();
  const [startTimeDatePickerOpen, setStartTimeDatePickerOpen] = useState(false);
  const [endTimeDatePickerOpen, setEndTimeDatePickerOpen] = useState(false);

  useEffect(() => {
    const tempTables = new Map<string, FlattenedRelations>();
    data.forEach((data) => {
      tempTables.set(data.table, data);
    });
    setYTables(tempTables);
  }, [data]);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<GraphFormInput>({
    defaultValues,
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const tempTables = new Map<string, TrackedFlattenedRelations>();

    if (yTable) {
      const yTableConfig = yTables.get(yTable);
      if (yTableConfig) {
        const relationsToProcess: { relation: SimpleForeignRelation; path: SimpleForeignRelation[] }[] =
          yTableConfig.relationships.map((relation) => {
            return {
              path: [
                relation,
                {
                  table: yTableConfig.table,
                  primaryKey: yTableConfig.primaryKey ?? '',
                  foreignKey: yTableConfig.primaryKey ?? ''
                }
              ],
              relation
            };
          });

        while (relationsToProcess.length > 0) {
          const relationData = relationsToProcess.shift()!;
          const tableConfig = yTables.get(relationData.relation.table);
          const tablePath = relationData.path.map((table) => table.table).join(',');
          if (!tempTables.has(tablePath) && tableConfig) {
            tempTables.set(tablePath, {
              table: relationData.relation.table,
              columns: tableConfig.columns,
              primaryKey: tableConfig.primaryKey,
              relationships: tableConfig.relationships,
              path: relationData.path
            });
            tableConfig.relationships.forEach((relation) => {
              if (relation.table !== tableConfig.table && !tablePath.includes(relation.table)) {
                relationsToProcess.unshift({ path: [relation].concat(relationData.path), relation });
              }
            });
          }
        }
      }
    }

    setXTables(tempTables);
  }, [yTable, yTables]);

  const onSubmit = async (formInput: GraphFormInput) => {
    try {
      if (!formInput.endTime) throw new Error('Please enter end time');
      if (!formInput.startTime) throw new Error('Please enter start time');
      console.log(formInput);
      await mutateAsync(transformGraphFormInputToCreateGraphArgs(formInput as ValidatedGraphFormInput));
      history.push(routes.STATISTICS);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  console.log(xTables);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(e);
        handleSubmit(onSubmit)(e);
      }}
      noValidate
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Title</FormLabel>
            <ReactHookTextField placeholder="Enter graph title" control={control} name="title" />
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Start Date</FormLabel>
            <Controller
              control={control}
              name="startTime"
              render={({ field: { value, onChange } }) => {
                return (
                  <DatePicker
                    value={value}
                    open={startTimeDatePickerOpen}
                    onClose={() => setStartTimeDatePickerOpen(false)}
                    onOpen={() => setStartTimeDatePickerOpen(true)}
                    onChange={onChange}
                    slotProps={{
                      textField: {
                        error: !!errors.startTime,
                        helperText: errors.startTime?.message,
                        onClick: () => setStartTimeDatePickerOpen(true),
                        inputProps: { readOnly: true },
                        fullWidth: true
                      }
                    }}
                  />
                );
              }}
            />
          </FormControl>
          <FormHelperText error={!!errors.startTime}>{errors.startTime?.message}</FormHelperText>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>End Date</FormLabel>
            <Controller
              control={control}
              name="endTime"
              render={({ field: { value, onChange } }) => {
                return (
                  <DatePicker
                    value={value}
                    open={endTimeDatePickerOpen}
                    onClose={() => setEndTimeDatePickerOpen(false)}
                    onOpen={() => setEndTimeDatePickerOpen(true)}
                    onChange={onChange}
                    slotProps={{
                      textField: {
                        error: !!errors.endTime,
                        helperText: errors.endTime?.message,
                        onClick: () => setEndTimeDatePickerOpen(true),
                        inputProps: { readOnly: true },
                        fullWidth: true
                      }
                    }}
                  />
                );
              }}
            />
          </FormControl>
          <FormHelperText error={!!errors.endTime}>{errors.endTime?.message}</FormHelperText>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ alignSelf: 'start' }}>Graph Type</FormLabel>
            <Controller
              control={control}
              name={'graphType'}
              render={({ field }) => (
                <Select
                  displayEmpty
                  placeholder={'Change Graph Type'}
                  sx={{ height: 56, width: '100%', textAlign: 'left' }}
                  fullWidth
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'right'
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'right'
                    }
                  }}
                  {...field}
                >
                  {Object.values(GraphType).map((graphType) => {
                    return (
                      <MenuItem key={graphType} value={graphType}>
                        {displayEnum(graphType)}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            />
          </FormControl>
          <FormHelperText error={!!errors.graphType}>{errors.graphType?.message}</FormHelperText>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ alignSelf: 'start' }}>Measure</FormLabel>
            <Controller
              control={control}
              name={'measure'}
              render={({ field }) => (
                <Select
                  displayEmpty
                  fullWidth
                  placeholder={'Change Measure'}
                  sx={{ height: 56, width: '100%', textAlign: 'left' }}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'right'
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'right'
                    }
                  }}
                  {...field}
                >
                  {Object.values(Measure).map((measure: Measure) => {
                    return (
                      <MenuItem key={measure} value={measure}>
                        {displayEnum(measure)}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            />
          </FormControl>
          <FormHelperText error={!!errors.measure}>{errors.measure?.message}</FormHelperText>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Select Data</FormLabel>
            <Controller
              name="yData"
              control={control}
              render={({ field: { value, onChange } }) => {
                return (
                  <>
                    <NERAutocomplete
                      sx={{ width: '100%' }}
                      id="yTableSelector"
                      onChange={(_, tableValue) => {
                        onChange({ table: tableValue?.id, column: null });
                        setYTable(tableValue?.id ?? null);
                      }}
                      size="medium"
                      value={value.table ? { label: value.table, id: value.table } : null}
                      placeholder="Select a table"
                      options={yTables.values().map(tableToAutoCompleteValue).toArray()}
                      errorMessage={errors.yData?.table}
                    />
                    <NERAutocomplete
                      sx={{ width: '100%' }}
                      id="yColumnSelector"
                      onChange={(_, columnValue) => onChange({ ...value, column: columnValue?.id })}
                      size="medium"
                      value={value.column ? { label: value.column, id: value.column } : null}
                      placeholder="Select a column"
                      options={
                        value.table ? yTables.get(value.table)?.columns.map(tableToColumnAutoCompleteValue).flat() ?? [] : []
                      }
                      errorMessage={errors.yData?.column}
                    />
                  </>
                );
              }}
            />
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Select Grouping Data</FormLabel>
            <Controller
              name="xData"
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <>
                    <NERAutocomplete
                      sx={{ width: '100%' }}
                      id="xTableSelector"
                      onChange={(_, tableValue) => {
                        console.log(tableValue);
                        onChange({
                          table: tableValue?.id,
                          column: null,
                          path: tableValue ? xTables.get(tableValue.label.replaceAll('->', ','))?.path : []
                        });
                      }}
                      size="medium"
                      value={
                        value.path
                          ? { label: value.path.map((relation) => relation.table).join('->'), id: value.table }
                          : null
                      }
                      placeholder="Select a table"
                      options={xTables.values().map(trackedTableToAutoCompleteValue).toArray()}
                      errorMessage={errors.xData?.table}
                    />
                    <NERAutocomplete
                      sx={{ width: '100%' }}
                      id="xColumnSelector"
                      onChange={(_, columnValue) =>
                        onChange({
                          ...value,
                          column: columnValue?.id
                        })
                      }
                      size="medium"
                      placeholder="Select a column"
                      value={value.column ? { label: value.column, id: value.column } : null}
                      options={
                        value.table ? yTables.get(value.table)?.columns.map(tableToColumnAutoCompleteValue).flat() ?? [] : []
                      }
                      errorMessage={errors.xData?.column}
                    />
                  </>
                );
              }}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} display={'flex'} justifyContent={'end'}>
          <NERFailButton sx={{ mr: 1 }} onClick={() => history.push('/statistics')}>
            Cancel
          </NERFailButton>
          <NERSuccessButton type="submit">Submit</NERSuccessButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default CreateGraphForm;
