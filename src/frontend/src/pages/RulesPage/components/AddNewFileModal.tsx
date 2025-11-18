import NERFormModal from '../../../components/NERFormModal';
import { useForm } from 'react-hook-form';
import { Box, TextField, Typography } from '@mui/material';
import { FormatUnderlined, Title } from '@mui/icons-material';

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

const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ open, onHide, onConfirm }) => {
  const { register, handleSubmit, reset } = useForm<NewFileFormData>({
    defaultValues: {
      name: '',
      car: '',
      isActive: false
    }
  });

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
      <Box></Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#ef4345',
            textDecoration: 'underline',
            fontSize: '1rem'
          }}
        >
          Name Ruleset File:
        </Typography>
        <TextField required autoComplete="off" placeholder={'Name File'} {...register('name')} />
      </Box>
    </NERFormModal>
  );
};

export default AddNewFileModal;
