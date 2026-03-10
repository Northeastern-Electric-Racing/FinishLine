import React from 'react';
import { Box, Typography, TextField, IconButton, Autocomplete, Checkbox, FormControlLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RemoveCircle } from '@mui/icons-material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Control, Controller, FieldError, FieldErrors, FieldValues, useWatch } from 'react-hook-form';

interface MemberOption {
  userId: string;
  firstName: string;
  lastName: string;
}

interface SponsorTaskCardProps {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  fieldPrefix: string;
  members: MemberOption[];
  onRemove: () => void;
  showDoneCheckbox?: boolean;
  isExistingTask?: boolean;
  defaultAssigneeName?: string;
}

const SponsorTaskCard: React.FC<SponsorTaskCardProps> = ({
  control,
  errors,
  fieldPrefix,
  members,
  onRemove,
  showDoneCheckbox = false,
  isExistingTask = false,
  defaultAssigneeName
}) => {
  const doneValue = useWatch({ control, name: `${fieldPrefix}.done` });
  const isDone = !!doneValue;
  const getError = (field: string): FieldError | undefined => {
    const parts = [...fieldPrefix.split('.'), field];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- traversing dynamic nested error paths requires indexing
    let obj: Record<string, unknown> | undefined = errors as Record<string, unknown>;
    for (const part of parts) {
      if (!obj) return undefined;
      obj = obj[part] as Record<string, unknown> | undefined;
    }
    return obj as FieldError | undefined;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        border: 1,
        borderColor: isDone ? 'success.main' : 'divider',
        borderRadius: 2,
        p: 2,
        borderLeft: isDone ? 4 : 1,
        borderLeftColor: isDone ? 'success.main' : 'divider',
        opacity: isDone ? 0.6 : 1
      }}
    >
      {showDoneCheckbox ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Controller
            control={control}
            name={`${fieldPrefix}.done`}
            render={({ field }) => (
              <FormControlLabel
                label={isDone ? 'Completed' : 'Mark as complete'}
                control={
                  <Checkbox
                    checked={!!field.value}
                    disabled={!isExistingTask}
                    size="small"
                    color="success"
                    onChange={() => {
                      field.onChange(!field.value);
                    }}
                  />
                }
                sx={{ ml: 0 }}
              />
            )}
          />
          <IconButton size="small" onClick={onRemove}>
            <RemoveCircle sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
          <IconButton size="small" onClick={onRemove}>
            <RemoveCircleOutlineIcon sx={{ color: 'white', fontSize: 20 }} />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
        <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
          <Typography variant="subtitle2" color="#EF4345" sx={{ mb: 0.5 }}>
            Due Date*
          </Typography>
          <Controller
            control={control}
            name={`${fieldPrefix}.dueDate`}
            render={({ field }) => (
              <DatePicker
                {...field}
                value={field.value ? new Date(field.value) : null}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    placeholder: 'MM/DD/YY',
                    fullWidth: true,
                    error: !!getError('dueDate')
                  }
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
          <Typography variant="subtitle2" color="#EF4345" sx={{ mb: 0.5 }}>
            Notify Date
          </Typography>
          <Controller
            control={control}
            name={`${fieldPrefix}.notifyDate`}
            render={({ field }) => (
              <DatePicker
                {...field}
                value={field.value ? new Date(field.value) : null}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    placeholder: 'MM/DD/YY',
                    fullWidth: true,
                    error: !!getError('notifyDate')
                  }
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Typography variant="subtitle2" color="#EF4345" sx={{ mb: 0.5 }}>
            Assign To
          </Typography>
          <Controller
            control={control}
            name={`${fieldPrefix}.assigneeUserId`}
            render={({ field }) => (
              <Autocomplete
                options={members}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                isOptionEqualToValue={(option, value) => option.userId === value.userId}
                value={members.find((u) => u.userId === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.userId || undefined)}
                size="small"
                fullWidth
                renderInput={(params) => <TextField {...params} placeholder={defaultAssigneeName || 'Select Member'} />}
              />
            )}
          />
        </Box>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="#EF4345" sx={{ mb: 0.5 }}>
          Notes*
        </Typography>
        <Controller
          control={control}
          name={`${fieldPrefix}.notes`}
          render={({ field }) => (
            <TextField
              {...field}
              multiline
              rows={3}
              fullWidth
              placeholder="Enter task notes"
              error={!!getError('notes')}
              helperText={getError('notes')?.message}
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default SponsorTaskCard;
