/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Control, Controller } from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';

interface ReactHookTextFieldProps {
  name: string;
  control: Control;
  rules?: any;
  defaultValue?: any;
  fullWidth?: boolean;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  sx?: any;
  type?: any;
  icon?: any;
}

const ReactHookTextField: React.FC<ReactHookTextFieldProps> = ({
  name,
  control,
  rules,
  defaultValue,
  fullWidth,
  label,
  placeholder,
  size,
  sx,
  type,
  icon
}) => {
  const defaultRules = { required: true };

  let inputProps = {};
  if (type === 'number') {
    inputProps = { inputProps: { min: 0 } };
  }
  if (icon) {
    inputProps = { ...inputProps, startAdornment: <InputAdornment position="start">{icon}</InputAdornment> };
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules || defaultRules}
      defaultValue={defaultValue}
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
          defaultValue={value}
        />
      )}
    />
  );
};

export default ReactHookTextField;
