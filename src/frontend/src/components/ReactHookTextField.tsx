/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Controller, FieldError } from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';

interface ReactHookTextFieldProps {
  name: string;
  control: any;
  rules?: any;
  fullWidth?: boolean;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  sx?: any;
  type?: any;
  icon?: any;
  multiline?: boolean;
  rows?: number;
  endAdornment?: any;
  errorMessage?: FieldError;
}

const ReactHookTextField = ({
  name,
  control,
  rules,
  fullWidth,
  label,
  placeholder,
  size,
  sx,
  type,
  icon,
  multiline,
  rows,
  endAdornment,
  errorMessage
}: ReactHookTextFieldProps) => {
  const defaultRules = { required: true };

  let inputProps = {};
  if (type === 'number') {
    inputProps = { inputProps: { min: 0 } };
  }
  if (icon) {
    inputProps = { ...inputProps, startAdornment: <InputAdornment position="start">{icon}</InputAdornment> };
  }
  if (endAdornment) {
    inputProps = { ...inputProps, endAdornment };
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules || defaultRules}
      render={({ field: { onChange, value } }) => (
        <TextField
          required
          id={`${name}-input`}
          autoComplete="off"
          onChange={onChange}
          value={value}
          fullWidth={fullWidth}
          label={label}
          placeholder={placeholder}
          size={size}
          sx={sx}
          type={type}
          InputProps={inputProps}
          multiline={multiline}
          rows={rows}
          error={!!errorMessage}
          helperText={errorMessage?.message}
        />
      )}
    />
  );
};

export default ReactHookTextField;
