import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { PartTagPayload, useCreatePartTag } from '../../../hooks/part-tag.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { PartTag } from 'shared';
import NERFormModal from '../../../components/NERFormModal';

const schema = yup.object().shape({
  question: yup.string().required('Id is Required'),
  answer: yup.string().required('Name is Required')
});

interface CreatePartTagProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: PartTag;
  onSubmit: (data: PartTagPayload) => Promise<PartTag>;
}

const CreatePartTagModal: React.FC<CreatePartTagProps> = ({ showModal, handleClose }) => {
  const { isLoading, isError, error, mutateAsync } = useCreatePartTag();

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
      showModal={showModal}
      handleClose={handleClose}
      title="New Tag"
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onSubmit={onsubmit}
      formId="new-part-tag-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Car</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreatePartTagModal;
