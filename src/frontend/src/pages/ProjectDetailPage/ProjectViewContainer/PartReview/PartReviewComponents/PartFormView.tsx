import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import NERFormModal from '../../../../../components/NERFormModal';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { PartTag } from 'shared';

const schema = yup.object().shape({
  index: yup.string().required('Enter an index!'),
  commonName: yup.string().required('Enter a Part Common Name!'),
  description: yup.string().optional(),
  tags: yup.string().optional(), //fix
  assignees: yup.string().optional(), //fix
  reviewers: yup.string().optional() //fix
});

export interface PartFormInput {
  index: string;
  commonName: string;
  description?: string;
  tags?: PartTag[];
  assignees?: string[];
  reviewers?: string[];
}

export interface PartFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: PartFormInput) => void;
  defaultValues?: PartFormInput;
  onHide: () => void;
  open: boolean;
}

const PartForm: React.FC<PartFormProps> = ({ submitText, onSubmit, defaultValues, onHide, open }) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<PartFormInput>({
    defaultValues: {
      index: defaultValues?.index ?? '',
      commonName: defaultValues?.commonName ?? '',
      description: defaultValues?.description ?? '',
      assignees: defaultValues?.assignees ?? [],
      reviewers: defaultValues?.reviewers ?? [],
    },
    resolver: yupResolver(schema)
  });

  const {
    data: manufactuers,
    isLoading: isLoadingManufactuers,
    isError: manufacturersIsError,
    error: manufacturersError
  } = useGetAllTags();

  return (
    <PartFormView
      onSubmit={onSubmit}
      allParts={parts}
      handleSubmit={handleSubmit}
      submitText={submitText}
      onHide={onHide}
      control={control}
      errors={errors}
      open={open}
      setValue={setValue}
    />
  );
};

export interface PartFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<PartFormInput>;
  onSubmit: (payload: PartFormInput) => void;
  onHide: () => void;
  control: Control<PartFormInput, any>;
  errors: FieldErrors<PartFormInput>;
  open: boolean;
}

const PartFormView: React.FC<PartFormViewProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  allParts,
  open,
  setValue
}) => {
  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={submitText + ' Part'}
      reset={() => {}}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-Part'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Tags (Optional)</FormLabel>
      </FormControl>
      <FormControl fullWidth sx={{ mb: '10px' }}>
        <FormLabel>Common Name</FormLabel>
        <ReactHookTextField
          control={control}
          name="CommonName"
          errorMessage={errors.name}
          placeholder="Name..."
          sx={{ width: 1 }}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Description (optional)</FormLabel>
        <ReactHookTextField
          control={control}
          name="Description"
          errorMessage={errors.notes}
          placeholder="Description of the part goes here..."
          sx={{ width: 1 }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default PartFormView;
