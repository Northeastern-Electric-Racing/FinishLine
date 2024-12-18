import { Autocomplete, FormControl, FormHelperText, FormLabel, Grid, MenuItem, Select, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { Car, GraphCollection, GraphDisplayType, GraphFormInput, GraphType, Measure, SpecialPermission } from 'shared';
import { displayEnum } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useState } from 'react';
import {
  graphCollectionToAutoCompleteValue,
  graphTypeToAutoCompleteValue,
  specialPermissionToAutoCompleteValue
} from '../../../utils/statistics.utils';

interface GraphFormViewProps {
  control: Control<GraphFormInput, any>;
  errors: FieldErrors<GraphFormInput>;
  graphCollections: GraphCollection[];
  cars: Car[];
}

export const GraphFormView: React.FC<GraphFormViewProps> = ({ control, errors, graphCollections, cars }) => {
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
            name={'graphDisplayType'}
            render={({ field }) => (
              <Select
                displayEmpty
                placeholder={'Change Graph Display Type'}
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
                {Object.values(GraphDisplayType).map((graphType) => {
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

      <Grid item xs={12}>
        <FormControl fullWidth>
          <FormLabel>Select Data</FormLabel>
          <Controller
            name="graphType"
            control={control}
            render={({ field: { value, onChange } }) => {
              return (
                <NERAutocomplete
                  sx={{ width: '100%' }}
                  id="graphTypeSelector"
                  onChange={(_, tableValue) => onChange(tableValue?.id)}
                  size="medium"
                  value={value ? graphTypeToAutoCompleteValue(value) : null}
                  placeholder="Select a graph type"
                  options={Object.values(GraphType).map(graphTypeToAutoCompleteValue)}
                  errorMessage={errors.graphType}
                />
              );
            }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <FormControl fullWidth>
          <FormLabel>Select Cars To Segment Data By</FormLabel>
          <Controller
            name="cars"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterSelectedOptions
                  multiple
                  id="carSelector"
                  options={cars}
                  value={value}
                  onChange={(_event, newValue) => onChange(newValue)}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Select Cars (Leave Blank For All Cars)" />
                  )}
                />
              );
            }}
          />
          <FormHelperText error={!!errors.cars}>{errors.cars?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <FormLabel>Additional Permissions to Apply to the Graph</FormLabel>
          <Controller
            name="specialPermissions"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterSelectedOptions
                  multiple
                  id="permissionsSelector"
                  options={Object.values(SpecialPermission).map(specialPermissionToAutoCompleteValue)}
                  value={value.map(specialPermissionToAutoCompleteValue)}
                  onChange={(_event, newValue) => onChange(newValue)}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Select Cars (Leave Blank For All Cars)" />
                  )}
                />
              );
            }}
          />
          <FormHelperText error={!!errors.cars}>{errors.cars?.message}</FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
};
