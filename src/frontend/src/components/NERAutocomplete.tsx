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
  autoStyle?: 'workPackage' | 'autoComplete';
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
  autoStyle = 'autoComplete'
}) => {
  const theme = useTheme();

  const autocompleteStyle = {
    height: '40px',
    backgroundColor: theme.palette.background.default,
    width: '100%',
    borderRadius: '25px',
    border: 0,
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: 'black',
      borderRadius: '25px'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'red'
    },
    ...sx
  };

  const workPackageStyle = {
    height: '40px',
    width: '100%',
    borderRadius: '4px',
    border: 0,
    ...sx
  };

  function chooseStyle() {
    if (autoStyle === 'workPackage') {
      return workPackageStyle;
    } else {
      return autocompleteStyle;
    }
  }

  const autocompleteRenderInput = (params: AutocompleteRenderInputParams) => {
    return (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
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
      sx={chooseStyle}
      size={size}
      renderInput={autocompleteRenderInput}
      value={value}
      filterSelectedOptions={filterSelectedOptions}
      ListboxProps={listboxProps}
    />
  );
};

export default NERAutocomplete;
