/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  Autocomplete,
  AutocompleteRenderInputParams,
  InputAdornment,
  SxProps,
  TextField,
  Theme,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { HTMLAttributes } from 'react';

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
  filterSelectedOptions
}) => {
  const theme = useTheme();

  const autocompleteStyle = {
    height: '40px',
    backgroundColor: theme.palette.background.default,
    width: '100%',
    border: '2px black',
    borderRadius: '25px',
    '&.Mui-focused': {
      borderColor: 'red'
    },
    ...sx
  };

  const autocompleteRenderInput = (params: AutocompleteRenderInputParams) => {
    return (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps
        }}
        placeholder={placeholder}
        required
      />
    );
  };

  return (
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
  );
};

export default NERAutocomplete;
