/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Control, Controller, FieldError } from 'react-hook-form';
import { TextField, InputAdornment, SxProps, Theme, SvgIconProps } from '@mui/material';
import { countWords, isUnderWordCount } from 'shared';

interface ReactHookTextFieldProps {
  name: string;
  control: Control<any, any>;
  rules?: Omit<any, any>;
  fullWidth?: boolean;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  type?: string;
  startAdornment?: SvgIconProps;
  multiline?: boolean;
  rows?: number;
  endAdornment?: React.ReactElement;
  errorMessage?: FieldError;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
}

const ReactHookTextField: React.FC<ReactHookTextFieldProps> = ({
  name,
  control,
  rules,
  fullWidth,
  label,
  placeholder,
  size,
  sx,
  type,
  startAdornment,
  multiline,
  rows,
  endAdornment,
  errorMessage,
  maxLength,
  required = true,
  disabled = false
}) => {
  const defaultRules = { required: true };

  let inputProps = {};
  if (type === 'number') {
    inputProps = { inputProps: { min: 0 } };
  }
  if (startAdornment) {
    inputProps = { ...inputProps, startAdornment: <InputAdornment position="start">{startAdornment}</InputAdornment> };
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
          required={required}
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
          inputProps={maxLength ? { ...inputProps, maxLength: isUnderWordCount(value, maxLength) ? null : 0 } : undefined}
          multiline={multiline}
          rows={rows}
          error={!!errorMessage}
          helperText={errorMessage ? errorMessage.message : maxLength ? `${countWords(value)}/300 words` : undefined}
          disabled={disabled}
        />
      )}
    />
  );
};

export default ReactHookTextField;
