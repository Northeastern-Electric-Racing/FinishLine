import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateMaterialType } from '../../../hooks/bom.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Vendor Name is Required')
});

interface CreateMaterialTypeModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateMaterialTypeModal: React.FC<CreateMaterialTypeModalProps> = ({ showModal, handleClose }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateMaterialType();

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
      name: ''
    }
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Material Type"
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-manufacturer-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Manufacturer Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreateMaterialTypeModal;
