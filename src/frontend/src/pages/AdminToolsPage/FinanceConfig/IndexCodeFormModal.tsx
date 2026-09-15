import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { IndexCode } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import { IndexCodePayload } from '../../../hooks/finance.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required')
});

interface IndexCodeFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: IndexCode;
  mutateAsync: (data: IndexCodePayload) => Promise<IndexCode>;
}

const IndexCodeFormModal: React.FC<IndexCodeFormModalProps> = ({ showModal, handleClose, defaultValues, mutateAsync }) => {
  const toast = useToast();

  const onSubmit = async (data: IndexCodePayload) => {
    try {
      await mutateAsync(data);
      toast.success(`Index Code: ${data.name} ${defaultValues ? 'edited' : 'created'} successfully!`);
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
      code: defaultValues?.code ?? ''
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={`${defaultValues ? 'Edit' : 'Create'} Index Code`}
      reset={() => reset({ name: '', code: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="edit-index-code-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
        <FormLabel>Code</FormLabel>
        <ReactHookTextField name="code" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.code?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default IndexCodeFormModal;
