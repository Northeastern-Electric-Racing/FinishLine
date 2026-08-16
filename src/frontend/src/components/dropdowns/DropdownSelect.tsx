/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, Chip, SxProps, TextField, Theme } from '@mui/material';

export interface DropdownOption {
  /** stable string key used for selection/equality (e.g. a userId or a piped wbs number) */
  key: string;
  label: string;
}

interface DropdownSelectProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  /** currently selected option keys */
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  /** defaults to true; pass false for a single-select (selectedKeys will hold 0 or 1 key) */
  multiple?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  variant?: 'outlined' | 'standard';
}

/**
 * Generic, reusable single/multi-select built on MUI Autocomplete. Works purely on string keys so
 * callers can map any domain value (userId, wbs number, car number, ...) to/from a key. This backs
 * the abstracted entity dropdowns used across the task filter bar and task form.
 */
const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  placeholder,
  options,
  selectedKeys,
  onChange,
  multiple = true,
  loading = false,
  size = 'small',
  sx,
  variant = 'outlined'
}) => {
  const selectedOptions = options.filter((option) => selectedKeys.includes(option.key));

  if (multiple) {
    return (
      <Autocomplete
        autoHighlight
        multiple
        size={size}
        loading={loading}
        options={options}
        value={selectedOptions}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, val) => option.key === val.key}
        onChange={(_, selected) => onChange(selected.map((option) => option.key))}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option.key} label={option.label} size="small" />
          ))
        }
        renderInput={(params) => <TextField {...params} variant={variant} label={label} placeholder={placeholder} />}
        sx={sx}
      />
    );
  }

  return (
    <Autocomplete
      size={size}
      loading={loading}
      options={options}
      value={selectedOptions[0] ?? null}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.key === val.key}
      onChange={(_, selected) => onChange(selected ? [selected.key] : [])}
      renderInput={(params) => <TextField {...params} variant={variant} label={label} placeholder={placeholder} />}
      sx={sx}
    />
  );
};

export default DropdownSelect;
