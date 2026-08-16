/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, Box, Chip, SxProps, TextField, Theme } from '@mui/material';
import { TaskLabel } from 'shared';
import { useAllTaskLabels } from '../../hooks/tasks.hooks';
import ErrorPage from '../../pages/ErrorPage';

interface LabelDropdownProps {
  /** selected task label ids */
  value: string[];
  onChange: (labelIds: string[]) => void;
  sx?: SxProps<Theme>;
}

/**
 * Reusable multi-select of task labels with the colored-chip styling. Lifted from the project task
 * board's inline label filter so the same control is shared across the project, work package, and
 * global task pages.
 */
const LabelDropdown: React.FC<LabelDropdownProps> = ({ value, onChange, sx }) => {
  const { data: taskLabels, isLoading, isError, error } = useAllTaskLabels();

  if (isError) return <ErrorPage message={error?.message} />;

  const labels = taskLabels ?? [];

  return (
    <Autocomplete
      autoHighlight
      multiple
      size="small"
      loading={isLoading}
      options={labels}
      getOptionLabel={(option: TaskLabel) => option.name}
      isOptionEqualToValue={(option, val) => option.taskLabelId === val.taskLabelId}
      value={labels.filter((label) => value.includes(label.taskLabelId))}
      onChange={(_, selected) => onChange(selected.map((label) => label.taskLabelId))}
      renderOption={(props, option) => (
        <li {...props} key={option.taskLabelId}>
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.25,
              borderRadius: '999px',
              backgroundColor: option.colorHexCode,
              color: 'white',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            {option.name}
          </Box>
        </li>
      )}
      renderTags={(selected, getTagProps) =>
        selected.map((label, index) => (
          <Chip
            {...getTagProps({ index })}
            key={label.taskLabelId}
            label={label.name}
            size="small"
            sx={{
              backgroundColor: label.colorHexCode,
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
            }}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} variant="outlined" label="Labels" placeholder="Filter by label" />}
      sx={sx}
    />
  );
};

export default LabelDropdown;
