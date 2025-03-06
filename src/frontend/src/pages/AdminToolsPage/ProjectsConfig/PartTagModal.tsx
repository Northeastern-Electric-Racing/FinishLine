import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { PartTagPayload, useCreatePartTag } from '../../../hooks/part-tag.hooks';
import { PartTag } from 'shared';

interface CreatePartTagProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: PartTag;
  onSubmit: (data: PartTagPayload) => Promise<PartTag>;
}

const schema = yup.object().shape({
  question: yup.string().required('Id is Required'),
  answer: yup.string().required('Name is Required')
});

const PartTagModal: React.FC<CreatePartTagProps> = ({ showModal, handleClose, defaultValues, onSubmit }) => {
  const { isLoading, isError, error, mutateAsync } = useCreatePartTag();

  const onFormSubmit = async (data: { name: string }) => {
    await onSubmit(data);
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
    watch, 
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: defaultValues?.partTagId ?? '',
      Name: defaultValues?.name ?? ''
    }
  });

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

export default PartTagModal;
