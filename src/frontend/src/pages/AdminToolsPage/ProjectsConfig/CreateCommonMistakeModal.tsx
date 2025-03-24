import { useForm, Controller } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Switch } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateCar } from '../../../hooks/cars.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Name is Required!'),
  description: yup.string().required('Description is Required!'),
  starred: yup.boolean().required('Starred is Required!'),
});

interface CreateCommonMistakesModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateCommonMistakesModal: React.FC<CreateCommonMistakesModalProps> = ({ showModal, handleClose }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateCar();
 
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
      name: '',
      description: '',
      starred: false
    }
  });


  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Common Mistake"
      reset={() => reset({ name: '', description: '', starred: false })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-car-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Title</FormLabel>
        <ReactHookTextField name="title" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>

        <FormLabel>Description</FormLabel>
        <ReactHookTextField name="description" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>

        <FormLabel>Starred</FormLabel>
        <Controller name="starred" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />

      </FormControl>
    </NERFormModal>
  );
};
export default CreateCommonMistakesModal;