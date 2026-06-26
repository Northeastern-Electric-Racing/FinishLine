import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateCar } from '../../../hooks/cars.hooks';

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
  const { isLoading, isError, error, mutateAsync } = useUpdateCar(carId);

  const onSubmit = async (data: { name: string }) => {
    try {
      await mutateAsync(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
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

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

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
