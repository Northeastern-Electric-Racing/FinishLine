import NERFormModal from '../../../components/NERFormModal';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';

interface AddNewFileModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: (data: FormData) => Promise<void>;
}

interface FormData {
  file: File;
  name: string;
  car: string;
  isActive: boolean;
}

const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ open, onHide, onConfirm }) => {
  const { register, handleSubmit, reset } = useForm<FormData>({
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
      <TextField required autoComplete="off" placeholder={'Name File'} {...register('name')} />
    </NERFormModal>
  );
};

export default AddNewFileModal;
