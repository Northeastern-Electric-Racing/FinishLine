import { useForm, Controller } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Switch } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreatePartReviewCommonMistake } from '../../../hooks/part-review.hooks';

const schema = yup.object().shape({
  title: yup.string().required('Title is Required!'),
  description: yup.string().required('Description is Required!'),
  starred: yup.boolean().required('Starred is Required!')
});

interface CreateCommonMistakesModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateCommonMistakesModal: React.FC<CreateCommonMistakesModalProps> = ({ showModal, handleClose }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreatePartReviewCommonMistake();

  const onSubmit = async (data: { title: string; description: string; starred: boolean }) => {
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
      title: '',
      description: '',
      starred: false
    }
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Common Mistake"
      reset={() => reset({ title: '', description: '', starred: false })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-common-mistake-form"
      showCloseButton
    >
      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormLabel>Title</FormLabel>
        <ReactHookTextField name="title" control={control} fullWidth />
        <FormHelperText error>{errors.title?.message}</FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormLabel>Description</FormLabel>
        <ReactHookTextField name="description" multiline={true} control={control} fullWidth />
        <FormHelperText error>{errors.description?.message}</FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormLabel>Starred</FormLabel>
        <Controller name="starred" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />
      </FormControl>
    </NERFormModal>
  );
};

export default CreateCommonMistakesModal;
