import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCreatePartTags } from '../../../hooks/part-tag.hooks';

interface CreatePartTagProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreatePartTagModal: React.FC<CreatePartTagProps> = ({ showModal, handleClose }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreatePartTags();

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
      title="New Tag"
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-part-tag-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Tag</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreatePartTagModal;
