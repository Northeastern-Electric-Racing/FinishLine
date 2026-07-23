import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEditCar } from '../../../hooks/cars.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Car Name is Required')
});

interface EditCarModalProps {
  showModal: boolean;
  handleClose: () => void;
  carId: string;
  carName: string;
}

const EditCarModal: React.FC<EditCarModalProps> = ({ showModal, handleClose, carId, carName }) => {
  const toast = useToast();
  const { mutateAsync } = useEditCar(carId);

  const onSubmit = async (data: { name: string }) => {
    try {
      await mutateAsync(data);
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
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
      name: carName
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="Edit Car"
      reset={() => reset({ name: carName })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="edit-car-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Car Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default EditCarModal;
