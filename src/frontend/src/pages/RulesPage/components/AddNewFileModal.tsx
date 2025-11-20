import NERFormModal from '../../../components/NERFormModal';
import Checkbox from '@mui/material/Checkbox';
import { useForm } from 'react-hook-form';
import { Box, TextField, Typography } from '@mui/material';
import { flexbox } from '@mui/system';

interface AddNewFileModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: (data: NewFileFormData) => Promise<void>;
}

interface NewFileFormData {
  file: File;
  name: string;
  car: string;
  isActive: boolean;
}

const sectionHeaderStyle = {
  fontWeight: 'bold',
  color: '#ef4345',
  textDecoration: 'underline',
  fontSize: '1rem'
};

const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ open, onHide, onConfirm }) => {
  const { register, handleSubmit, reset, watch } = useForm<NewFileFormData>({
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={sectionHeaderStyle}>
              Car:
            </Typography>
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
