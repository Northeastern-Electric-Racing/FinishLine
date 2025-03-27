import { useForm, Controller } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Switch } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEditPartReviewCommonMistakes } from '../../../hooks/part-review.hooks';
import type { PartReviewCommonMistake } from 'shared';

const schema = yup.object().shape({
  title: yup.string().required('Title is Required!'),
  description: yup.string().required('Description is Required!'),
  starred: yup.boolean().required('Starred is Required!')
});

interface EditCommonMistakeModalProps {
  showModal: boolean;
  handleClose: () => void;
  mistake: PartReviewCommonMistake;
}

const EditCommonMistakeModal: React.FC<EditCommonMistakeModalProps> = ({ showModal, handleClose, mistake }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useEditPartReviewCommonMistakes();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: mistake.title,
      description: mistake.description,
      starred: mistake.starred
    }
  });

  const onSubmit = async (data: { title: string; description: string; starred: boolean }) => {
    try {
      await mutateAsync({
        commonMistakeId: mistake.partReviewCommonMistakeId,
        payload: data
      });
      toast.success('Common Mistake updated');
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="Edit Common Mistake"
      reset={() => reset(mistake)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="edit-common-mistake-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Title</FormLabel>
        <ReactHookTextField name="title" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.title?.message}</FormHelperText>

        <FormLabel>Description</FormLabel>
        <ReactHookTextField name="description" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.description?.message}</FormHelperText>

        <FormLabel>Starred</FormLabel>
        <Controller name="starred" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />
      </FormControl>
    </NERFormModal>
  );
};

export default EditCommonMistakeModal;
