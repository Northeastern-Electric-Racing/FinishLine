/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, InputAdornment, TextField, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface NERAutocompleteProps {
  id: string;
  options: { label: string; id: any }[];
  onChange: (event: React.SyntheticEvent<Element, Event>, value: { label: string; id: any } | null) => void;
  size: 'small' | 'medium' | undefined;
  placeholder: string;
  sx?: any;
  value?: { label: string; id: any } | null;
}

const NERAutocomplete: React.FC<NERAutocompleteProps> = ({ id, onChange, options, size, placeholder, sx, value }) => {
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

  const autocompleteRenderInput = (params: any) => {
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
      sx={autocompleteStyle}
      size={size}
      renderInput={autocompleteRenderInput}
      value={value}
    />
  );
};

export default NERAutocomplete;
