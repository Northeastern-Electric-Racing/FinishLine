import NERFormModal from '../../../components/NERFormModal';
import Checkbox from '@mui/material/Checkbox';
import { useForm } from 'react-hook-form';
import { Box, TextField, Typography } from '@mui/material';
import { flexbox } from '@mui/system';
import { useState } from 'react';
import { Console } from 'console';
import { NERButton } from '../../../components/NERButton';

interface AddNewFileModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: (data: NewFileFormData) => Promise<void>;
  carOptions: string[];
}

interface NewFileFormData {
  file: File;
  name: string;
  car: string;
  isActive: boolean;
}

interface ButtonGroupProps {
  options: string[];
  onChange: (option: string) => any;
}

const sectionHeaderStyle = {
  fontWeight: 'bold',
  color: '#ef4345',
  textDecoration: 'underline',
  fontSize: '1rem'
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, onChange }) => {
  const [selected, setSelected] = useState('');

  const handleClick = (option: string) => {
    setSelected(option);
    onChange(option);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => handleClick(option)}
          style={{
            borderRadius: 6,
            border: 0,
            backgroundColor: selected === option ? '#ef4345' : '#c7c7c7ff',
            transition: 'background-color 120ms ease'
          }}
        >
          {<Typography> {option} </Typography>}
        </button>
      ))}
    </div>
  );
};

const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ open, onHide, onConfirm, carOptions }) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm<NewFileFormData>({
    defaultValues: {
      name: '',
      car: '',
      isActive: false
    }
  });

  const isActive = watch('isActive');

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title="Add New File"
      hideFormButtons
      showCloseButton
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onConfirm}
      formId={'add-new-file-form'}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={sectionHeaderStyle}>
              Car:
            </Typography>
            <ButtonGroup options={carOptions} onChange={(value) => setValue('car', value)}></ButtonGroup>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={sectionHeaderStyle}>
              Active:
            </Typography>
            <Checkbox {...register('isActive')} checked={isActive} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ ...sectionHeaderStyle, pb: 1 }}>
          Name Ruleset File:
        </Typography>
        <TextField
          inputProps={{ style: { fontSize: 13 } }}
          required
          autoComplete="off"
          placeholder={'Name File'}
          {...register('name')}
        />
      </Box>
    </NERFormModal>
  );
};

export default AddNewFileModal;
