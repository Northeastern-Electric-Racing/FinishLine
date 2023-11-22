/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  Autocomplete,
  AutocompleteRenderInputParams,
  FormHelperText,
  SxProps,
  TextField,
  Theme,
  useTheme
} from '@mui/material';
import { HTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';

interface NERAutocompleteProps {
  id: string;
  options: { label: string; id: string }[];
  onChange: (event: React.SyntheticEvent<Element, Event>, value: { label: string; id: string } | null) => void;
  size: 'small' | 'medium' | undefined;
  placeholder: string;
  sx?: SxProps<Theme>;
  value?: { label: string; id: string } | null;
  listboxProps?: HTMLAttributes<HTMLUListElement>;
  filterSelectedOptions?: boolean;
  errorMessage?: FieldError;
}

const NERAutocomplete: React.FC<NERAutocompleteProps> = ({
  id,
  onChange,
  options,
  size,
  placeholder,
  sx,
  value,
  listboxProps,
  filterSelectedOptions,
  errorMessage
}) => {
  const theme = useTheme();

  const autocompleteStyle = {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    border: 0,
    borderColor: 'black',
    ...sx
  };

  const autocompleteRenderInput = (params: AutocompleteRenderInputParams) => {
    return (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps,
          sx: { height: '56px' }
        }}
        placeholder={placeholder}
        required
      />
    );
  };

  return (
    <>
      <Autocomplete
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disablePortal
        id={id}
        onChange={onChange}
        options={options}
        sx={autocompleteStyle}
        size={size}
        renderInput={autocompleteRenderInput}
        value={value}
        filterSelectedOptions={filterSelectedOptions}
        ListboxProps={listboxProps}
      />
      <FormHelperText error={!!errorMessage}>{errorMessage?.message}</FormHelperText>
    </>
  );
};

export default NERAutocomplete;
