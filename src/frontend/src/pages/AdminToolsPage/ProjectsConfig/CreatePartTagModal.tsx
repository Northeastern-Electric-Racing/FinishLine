import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ErrorPage from '../../ErrorPage';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { PartTagPayload, useCreatePartTag } from '../../../hooks/part-review.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { PartTag } from 'shared';
import NERFormModal from '../../../components/NERFormModal';

const schema = yup.object().shape({
  partTagId: yup.string().required('Id is Required'),
  name: yup.string().required('Name is Required')
});

interface CreatePartTagProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: PartTag;
}

const CreatePartTagModal: React.FC<CreatePartTagProps> = ({ showModal, handleClose, defaultValues }) => {
  const { isLoading, isError, error, mutateAsync } = useCreatePartTag();
  const toast = useToast();

  const onSubmit = async (data: PartTagPayload) => {
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
      partTagId: defaultValues?.partTagId ?? '',
      name: defaultValues?.name ?? '',
    }
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Tag"
      reset={() => reset({ partTagId: '', name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-part-tag-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Tag Id</FormLabel>
        <ReactHookTextField name="partTagId" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.partTagId?.message}</FormHelperText>
        <FormLabel>Tag Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreatePartTagModal;
