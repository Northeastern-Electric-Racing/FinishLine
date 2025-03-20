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
  name: yup.string().required('Name is Required'),
  colorHexCode: yup.string().default('#FF0000')
});

interface CreatePartTagProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: PartTag;
}

const CreatePartTagModal: React.FC<CreatePartTagProps> = ({ showModal, handleClose, defaultValues }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreatePartTag();

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
      name: defaultValues?.name ?? '',
      colorHexCode: defaultValues?.colorHexCode ?? '#FF0000'
    }
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Tag"
      reset={() => reset({ name: '', colorHexCode: '' })}
      reset={() => reset({ name: '', colorHexCode: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-part-tag-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Tag Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
        <FormLabel>Color</FormLabel>
        <ReactHookTextField name="colorHexCode" control={control} sx={{ width: 1 }} placeholder="#FF0000" />
        <FormHelperText error>{errors.colorHexCode?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreatePartTagModal;
