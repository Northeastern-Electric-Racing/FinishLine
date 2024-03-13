import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateUnit } from '../../../hooks/bom.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Unit Name is Required')
});

interface CreateUnitTypeModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateUnitModal: React.FC<CreateUnitTypeModalProps> = ({ showModal, handleClose }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateUnit();

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
      title="New Unit"
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-unit"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Unit Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreateUnitModal;
