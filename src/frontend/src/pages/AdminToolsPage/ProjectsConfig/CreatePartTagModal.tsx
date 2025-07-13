import { FormControl, FormHelperText, FormLabel, Box } from '@mui/material';
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
  tagCreated?: (partTagId: string) => void;
}

const CreatePartTagModal: React.FC<CreatePartTagProps> = ({ showModal, handleClose, defaultValues, tagCreated }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreatePartTag();

  const onSubmit = async (data: PartTagPayload) => {
    try {
      const createdTag = await mutateAsync(data);
      if (tagCreated) {
        tagCreated(createdTag.partTagId);
      }
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
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      colorHexCode: defaultValues?.colorHexCode ?? '#FF0000'
    }
  });

  const colorValue = watch('colorHexCode');

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Tag"
      reset={() => reset({ name: '', colorHexCode: '#FF0000' })}
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ReactHookTextField name="colorHexCode" control={control} sx={{ width: 1 }} placeholder="#FF0000" />
          <Box
            sx={{
              width: 40,
              height: 40,
              border: '1px solid #ccc',
              borderRadius: 1,
              backgroundColor: colorValue || '#FF0000'
            }}
          />
        </Box>
        <FormHelperText error>{errors.colorHexCode?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CreatePartTagModal;
