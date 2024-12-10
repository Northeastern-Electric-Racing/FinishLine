import { FormControl, FormHelperText, FormLabel, Grid, MenuItem, Select } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import {
  FlattenedRelations,
  GraphCollection,
  GraphFormInput,
  GraphType,
  Measure,
  TrackedFlattenedRelations
} from 'shared';
import { displayEnum } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useState } from 'react';
import {
  graphCollectionToAutoCompleteValue,
  tableToAutoCompleteValue,
  tableToColumnAutoCompleteValue,
  trackedTableToAutoCompleteValue
} from '../../../utils/statistics.utils';

interface GraphFormViewProps {
  control: Control<GraphFormInput, any>;
  errors: FieldErrors<GraphFormInput>;
  setYTable: (table: string | null) => void;
  xTables: Map<string, TrackedFlattenedRelations>;
  yTables: Map<string, FlattenedRelations>;
  graphCollections: GraphCollection[];
}

export const GraphFormView: React.FC<GraphFormViewProps> = ({
  control,
  errors,
  xTables,
  setYTable,
  yTables,
  graphCollections
}) => {
  const [startTimeDatePickerOpen, setStartTimeDatePickerOpen] = useState(false);
  const [endTimeDatePickerOpen, setEndTimeDatePickerOpen] = useState(false);

  return (
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

      <Grid item xs={12}>
        <FormControl fullWidth>
          <FormLabel>Select Graph Collection</FormLabel>
          <Controller
            name="graphCollectionId"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <NERAutocomplete
                  sx={{ width: '100%' }}
                  id="graphCollectionSelector"
                  onChange={(_, collectionValue) => onChange(collectionValue?.id)}
                  size="medium"
                  value={{ label: value ?? '', id: value ?? '' }}
                  placeholder="Select a collection (optional)"
                  options={graphCollections.map(graphCollectionToAutoCompleteValue)}
                  errorMessage={errors.graphCollectionId}
                />
              );
            }}
          />
        </FormControl>
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
                    options={Array.from(yTables.values()).map(tableToAutoCompleteValue)}
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
                      value.table
                        ? yTables
                            .get(value.table)
                            ?.columns.filter((column) => column.dataType === 'integer')
                            .map(tableToColumnAutoCompleteValue)
                            .flat() ?? []
                        : []
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
                      if (tableValue) {
                        const relation: TrackedFlattenedRelations = JSON.parse(tableValue.id);

                        onChange({
                          table: relation.table,
                          column: null,
                          path: relation.path
                        });
                      }
                    }}
                    size="medium"
                    value={
                      value.path
                        ? {
                            label: value.path.map((relation) => relation.table).join('->'),
                            id: JSON.stringify(value)
                          }
                        : null
                    }
                    placeholder="Select a table"
                    options={Array.from(xTables.values()).map(trackedTableToAutoCompleteValue)}
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
    </Grid>
  );
};
