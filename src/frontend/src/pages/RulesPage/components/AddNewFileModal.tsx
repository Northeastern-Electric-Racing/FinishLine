import NERFormModal from '../../../components/NERFormModal';
import { useForm, Controller } from 'react-hook-form';
import { Box, FormControl, TextField, Typography, FormLabel, FormHelperText, Button, Select, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../hooks/toasts.hooks';
import { FileUpload } from '@mui/icons-material';
import { MAX_FILE_SIZE } from 'shared';
import { useUploadRulesetFile } from '../../../hooks/rules.hooks';
import { useGetAllCars } from '../../../hooks/cars.hooks';

interface AddNewFileModalProps {
  open: boolean;
  onHide: () => void;
  onFormSubmit: (data: NewFileFormData) => Promise<void>;
}

interface NewFileFormData {
  fileId: string;
  name: string;
  carNumber: number;
  parserType: 'FSAE' | 'FHE';
}

interface ButtonGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => any;
}

const sectionHeaderStyle = {
  fontWeight: 'bold',
  color: '#ef4345',
  textDecoration: 'underline',
  fontSize: '1rem',
  textUnderlineOffset: '5px',
  marginBottom: '10px'
};

const isPdf = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'pdf';
};

const schema = yup.object({
  fileId: yup.string().required('File is required'),
  name: yup.string().required('Name is required'),
  carNumber: yup.number().min(0).required('Car is required'),
  parserType: yup.string().oneOf(['FSAE', 'FHE']).required('Parser type is required')
});

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          style={{
            borderRadius: 6,
            height: 25,
            border: 0,
            backgroundColor: value === option ? '#ef4345' : '#c7c7c7ff',
            transition: 'background-color 120ms ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (value !== option) {
              e.currentTarget.style.backgroundColor = '#dededeff';
            }
          }}
          onMouseLeave={(e) => {
            if (value !== option) {
              e.currentTarget.style.backgroundColor = '#c7c7c7ff';
            }
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', px: 1 }}>{option}</Typography>
          {/* ? need ?*/}
        </button>
      ))}
    </div>
  );
};

const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ open, onHide, onFormSubmit }) => {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadFile } = useUploadRulesetFile();
  const { data: cars, isLoading: carsLoading, isError: carsError } = useGetAllCars();

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    control
  } = useForm<NewFileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fileId: '',
      name: '',
      carNumber: 0,
      parserType: 'FSAE'
    }
  });

  useEffect(() => {
    if (cars && cars.length > 0) {
      setValue('carNumber', cars[0].wbsNum.carNumber);
    }
  }, [cars, setValue]);

  const handleFormSubmit = async (data: NewFileFormData) => {
    try {
      await onFormSubmit(data);
      toast.success('File Successfully Added');
      setFile(null);
      reset();
      onHide();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const [selectedFile] = e.target.files;

    if (!isPdf(selectedFile.name)) {
      const error = 'File must be a PDF';
      toast.error(error);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      const error = `File exceeds the maximum size limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`;
      toast.error(error);
      return;
    }

    setUploading(true);

    try {
      const fileId = await uploadFile(selectedFile);
      setValue('fileId', fileId, { shouldValidate: true });
      setFile(selectedFile);
      toast.success('File uploaded successfully');
    } catch (error: unknown) {
      let errorMessage = 'File upload failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
      setFile(null);
      setValue('fileId', '', { shouldValidate: false });
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    setFile(null);
    reset();
    onHide();
  };

  const handleReset = () => {
    setFile(null);
    reset();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleModalClose}
      title="Add New File"
      reset={handleReset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleFormSubmit}
      formId={'add-new-file-form'}
      showCloseButton
      disabled={uploading}
    >
      <Box>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* File Upload */}
            <FormControl sx={{ flex: 2 }} error={!!errors.fileId}>
              <FormLabel sx={sectionHeaderStyle}>Upload Ruleset File:</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {file && <Typography>{file.name}</Typography>}
                {uploading && <Typography>Uploading...</Typography>}
                <Button
                  variant="contained"
                  color="success"
                  component="label"
                  startIcon={<FileUpload />}
                  disabled={uploading || !!file}
                >
                  {file ? 'File Selected' : 'Select File'}
                  <input type="file" accept="application/pdf" hidden onChange={handleFileUpload} />
                </Button>
              </Box>
              <FormHelperText error>{errors.fileId?.message}</FormHelperText>
            </FormControl>

            {/* Car */}
            <FormControl error={!!errors.carNumber}>
              <FormLabel sx={sectionHeaderStyle}>Car:</FormLabel>
              {carsLoading ? (
                <Typography sx={{ fontSize: '0.875rem' }}>Loading cars...</Typography>
              ) : carsError ? (
                <Typography sx={{ fontSize: '0.875rem', color: 'error.main' }}>Failed to load cars</Typography>
              ) : (
                <Controller
                  name="carNumber"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} size="small">
                      {cars?.map((car) => (
                        <MenuItem key={car.id} value={car.wbsNum.carNumber}>
                          {car.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              )}
              <FormHelperText error>{errors.carNumber?.message}</FormHelperText>
            </FormControl>

            {/* Parser Type */}
            <FormControl error={!!errors.parserType}>
              <FormLabel sx={sectionHeaderStyle}>Parser Type:</FormLabel>
              <Controller
                name="parserType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ButtonGroup options={['FSAE', 'FHE']} value={value} onChange={(val) => onChange(val as 'FSAE' | 'FHE')} />
                )}
              />
              <FormHelperText error>{errors.parserType?.message}</FormHelperText>
            </FormControl>
          </Box>

          {/* Ruleset Name */}
          <FormControl error={!!errors.name}>
            <FormLabel sx={sectionHeaderStyle}>Name Ruleset File:</FormLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} autoComplete="off" placeholder="Name File" error={!!errors.name} />
              )}
            />
            <FormHelperText error>{errors.name?.message}</FormHelperText>
          </FormControl>
        </Box>
      </Box>
    </NERFormModal>
  );
};

export default AddNewFileModal;
