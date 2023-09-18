import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useCreateVendor } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  name: yup.string().required('Vendor Name is Required')
});

interface NewVendorProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateVendorModal = ({ showModal, handleClose }: NewVendorProps) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateVendor();

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
      title="New Vendor"
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-vendor-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Vendor Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreateVendorModal;
