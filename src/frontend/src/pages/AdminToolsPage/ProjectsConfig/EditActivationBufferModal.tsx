import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSetActivationBufferDays } from '../../../hooks/organizations.hooks';

const schema = yup.object().shape({
  activationBufferDays: yup
    .number()
    .typeError('Buffer days must be a number')
    .required('Buffer days is required')
    .integer('Buffer days must be a whole number')
    .min(0, 'Buffer days must not be negative')
});

interface EditActivationBufferModalProps {
  showModal: boolean;
  handleClose: () => void;
  activationBufferDays: number;
}

const EditActivationBufferModal: React.FC<EditActivationBufferModalProps> = ({
  showModal,
  handleClose,
  activationBufferDays
}) => {
  const toast = useToast();
  const { mutateAsync } = useSetActivationBufferDays();

  const onSubmit = async (data: { activationBufferDays: number }) => {
    try {
      await mutateAsync(data.activationBufferDays);
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      activationBufferDays
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="Edit Activation Buffer"
      reset={() => reset({ activationBufferDays })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="edit-activation-buffer-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Activation Buffer (days)</FormLabel>
        <ReactHookTextField name="activationBufferDays" control={control} type="number" sx={{ width: 1 }} />
        <FormHelperText error>{errors.activationBufferDays?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default EditActivationBufferModal;
