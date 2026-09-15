import { useForm, Controller } from 'react-hook-form';
import { FormControl, FormLabel, FormHelperText, Switch } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import NERFormModal from '../../../components/NERFormModal';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  title: yup.string().required('Title is Required!'),
  description: yup.string().required('Description is Required!'),
  starred: yup.boolean().required('Starred is Required!')
});

export interface CommonMistakeFormValues {
  title: string;
  description: string;
  starred: boolean;
}

interface CommonMistakeFormModalProps {
  open: boolean;
  onHide: () => void;
  title: string;
  defaultValues: CommonMistakeFormValues;
  onSubmit: (values: CommonMistakeFormValues) => Promise<void>;
  formId: string;
}

export const CommonMistakeFormModal: React.FC<CommonMistakeFormModalProps> = ({
  open,
  onHide,
  title: modalTitle,
  defaultValues,
  onSubmit,
  formId
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CommonMistakeFormValues>({
    resolver: yupResolver(schema),
    defaultValues
  });

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={modalTitle}
      reset={() => reset(defaultValues)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={formId}
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
