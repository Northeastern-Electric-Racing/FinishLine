import NERFormModal from '../../../components/NERFormModal';
import Checkbox from '@mui/material/Checkbox';
import { useForm, Controller } from 'react-hook-form';
import { Box, FormControl, TextField, Typography, FormLabel, FormHelperText, Button } from '@mui/material';
import { useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../hooks/toasts.hooks';
import { FileUpload } from '@mui/icons-material';
import { MAX_FILE_SIZE } from 'shared';
import { useUploadRulesetFile } from '../../../hooks/rules.hooks';

interface AddNewFileModalProps {
  open: boolean;
  onHide: () => void;
  onFormSubmit: (data: NewFileFormData) => Promise<void>;
  carOptions: string[];
}

interface NewFileFormData {
  fileId: string;
  name: string;
  car: string;
  isActive: boolean;
  parserType: 'FSAE' | 'FHE';
}

const isPdf = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'pdf';
};

interface ButtonGroupProps {
  options: string[];
  value: string;
  onChange: (option: string) => any;
  error?: boolean;
}

const sectionHeaderStyle = {
  fontWeight: 'bold',
  color: '#ef4345',
  fontSize: '1rem'
};

const schema = yup.object({
  fileId: yup.string().required('File is required'),
  name: yup.string().required('Name is required'),
  car: yup.string().required('Car is required'),
  isActive: yup.boolean().required(),
  parserType: yup.string().oneOf(['FSAE', 'FHE']).required('Parser type is required')
});

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, value, onChange, error }) => {
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
            border: error ? '1px solid #d32f2f' : 0,
            backgroundColor: value === option ? '#ef4345' : '#c7c7c7ff',
            transition: 'background-color 120ms ease',
            cursor: 'pointer'
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', px: 1 }}>{option}</Typography>
        </button>
      ))}
    </div>
  );
};

const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ open, onHide, onFormSubmit, carOptions }) => {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadFile } = useUploadRulesetFile();

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    control
  } = useForm<NewFileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fileId: '',
      name: '',
      car: '',
      isActive: false,
      parserType: 'FSAE'
    }
  });
  const carValue = watch('car');
  const parserTypeValue = watch('parserType');

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

  return (
    <NERFormModal
      open={open}
      onHide={() => {
        setFile(null);
        reset();
        onHide();
      }}
      title="Add New File"
      reset={() => {
        setFile(null);
        reset();
      }}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleFormSubmit}
      formId={'add-new-file-form'}
      showCloseButton
      disabled={uploading}
    >
      <Box>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* File Upload */}
            <FormControl sx={{ flex: 2 }}>
              <FormLabel sx={sectionHeaderStyle}>Upload Ruleset File</FormLabel>
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
                  {file ? 'File Selected' : 'Upload'}
                  <input
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const [selectedFile] = e.target.files;

                        if (!isPdf(selectedFile.name)) {
                          toast.error('File must be a PDF');
                          return;
                        }

                        if (selectedFile.size > MAX_FILE_SIZE) {
                          toast.error(`File exceeds the maximum size limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
                          return;
                        }
                        setUploading(true);
                        try {
                          const fileId = await uploadFile(selectedFile);
                          setValue('fileId', fileId, { shouldValidate: true });
                          setFile(selectedFile);
                          toast.success('File uploaded successfully');
                        } catch (error: unknown) {
                          toast.error('File upload failed');
                        } finally {
                          setUploading(false);
                        }
                      }
                    }}
                  />
                </Button>
              </Box>
              <FormHelperText error>{errors.fileId?.message}</FormHelperText>
            </FormControl>
            {/* Car */}
            <FormControl>
              <FormLabel sx={sectionHeaderStyle}>Car</FormLabel>
              <Controller
                name="car"
                control={control}
                render={({ field: { onChange } }) => (
                  <ButtonGroup options={carOptions} value={carValue} onChange={onChange} error={!!errors.car} />
                )}
              />
              <FormHelperText error>{errors.car?.message}</FormHelperText>
            </FormControl>
            {/* Parser Type */}
            <FormControl>
              <FormLabel sx={sectionHeaderStyle}>Parser Type</FormLabel>
              <Controller
                name="parserType"
                control={control}
                render={({ field: { onChange } }) => (
                  <ButtonGroup
                    options={['FSAE', 'FHE']}
                    value={parserTypeValue}
                    onChange={(value) => onChange(value as 'FSAE' | 'FHE')}
                    error={!!errors.parserType}
                  />
                )}
              />
              <FormHelperText error>{errors.parserType?.message}</FormHelperText>
            </FormControl>
            {/* Active */}
            <FormControl>
              <FormLabel sx={sectionHeaderStyle}>Active</FormLabel>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => <Checkbox {...field} checked={field.value} sx={{ mt: -1 }} />}
              />
            </FormControl>
          </Box>
          {/* Ruleset Name */}
          <FormControl fullWidth>
            <FormLabel sx={sectionHeaderStyle}>Name Ruleset File</FormLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} autoComplete="off" placeholder="Name File" error={!!errors.name} fullWidth />
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
