import NERFormModal from '../../../components/NERFormModal';
import Checkbox from '@mui/material/Checkbox';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Typography } from '@mui/material';
import { useState, useRef } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

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

const schema = yup.object({
  file: yup
    .mixed<File>()
    .required('File is required')
    .test('is-pdf', 'File must be a PDF', (file) => (file ? file.type === 'application/pdf' : false)),
  name: yup.string().required('Name is required'),
  car: yup.string().required('Car is required'),
  isActive: yup.boolean().required()
});

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, onChange }) => {
  const [selected, setSelected] = useState('');

  const handleClick = (option: string) => {
    setSelected(option);
    onChange(option);
  };

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => handleClick(option)}
          style={{
            borderRadius: 6,
            height: 25,
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
  // For general information in the form
  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control
  } = useForm<NewFileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      file: undefined,
      name: '',
      car: '',
      isActive: false
    }
  });

  const isActive = watch('isActive');

  // For file inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

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
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" sx={sectionHeaderStyle}>
              Upload Ruleset File:
            </Typography>
            <button
              type="button"
              onClick={handleAddFileClick}
              style={{
                borderRadius: 6,
                border: 0,
                backgroundColor: '#c7c7c7ff',
                transition: 'background-color 120ms ease'
              }}
            >
              <Typography> Select File</Typography>
            </button>
            <Controller
              name="file"
              control={control}
              render={({ field: { onChange, ...field } }) => (
                <input
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  ref={(e) => {
                    fileInputRef.current = e;
                    field.ref(e);
                  }}
                  onChange={(e) => {
                    const { files } = e.target;
                    if (files && files.length > 0) {
                      onChange(files[0]);
                    }
                  }}
                />
              )}
            />
            {errors.file && (
              <Typography color="error" sx={{ fontSize: 12, mt: 0.5 }}>
                {errors.file.message as string}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="h6" sx={sectionHeaderStyle}>
              Car:
            </Typography>
            <ButtonGroup
              options={carOptions}
              onChange={(value) => setValue('car', value, { shouldValidate: true })}
            ></ButtonGroup>
            <input type="hidden" {...register('car')} />
            {errors.car && (
              <Typography color="error" sx={{ fontSize: 12, mt: 0.5 }}>
                {errors.car.message as string}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            <Typography variant="h6" sx={{ ...sectionHeaderStyle, lineHeight: '27.5px' }}>
              Active:
            </Typography>
            <Checkbox {...register('isActive')} sx={{ mt: '-5.5px' }} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ ...sectionHeaderStyle, pb: 0.5 }}>
          Name Ruleset File:
        </Typography>
        <TextField
          inputProps={{ style: { fontSize: 13 } }}
          autoComplete="off"
          placeholder={'Name File'}
          {...register('name')}
        />
        {errors.name && (
          <Typography color="error" sx={{ fontSize: 12, mt: 0.5 }}>
            {errors.name.message}
          </Typography>
        )}
      </Box>
    </NERFormModal>
  );
};

export default AddNewFileModal;
