import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import NERFormModal from '../../../../../components/NERFormModal';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const schema = yup.object().shape({
  partId: yup.string().required('Select a Part!'),
  fileIds: yup.array().of(yup.string().defined()).required(), //????
  submissionId:  yup.string().required('Select a Submission!'),
  notes: yup.string().optional()
});

export interface ReviewFormInput {
  partId: string;
  fileIds: string[];
  submissionId: string;
  notes?: string;
}

export interface ReviewFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: ReviewFormInput) => void;
  defaultValues?: ReviewFormInput;
  onHide: () => void;
  open: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ submitText, onSubmit, defaultValues, onHide, open }) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<ReviewFormInput>({
    defaultValues: {
      partId: defaultValues?.partId ?? '',
      fileIds: defaultValues?.fileIds ?? [],
      name: defaultValues?.name ?? '',
      notes: defaultValues?.notes ?? ''
    },
    resolver: yupResolver(schema)
  });

  const {
    data: manufactuers,
    isLoading: isLoadingManufactuers,
    isError: manufacturersIsError,
    error: manufacturersError
  } = useGetAllReviews();

  return (
    <ReviewFormView
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

export interface ReviewFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<ReviewFormInput>;
  onSubmit: (payload: ReviewFormInput) => void;
  onHide: () => void;
  control: Control<ReviewFormInput, any>;
  errors: FieldErrors<ReviewFormInput>;
  open: boolean;
}

const ReviewFormView: React.FC<ReviewFormViewProps> = ({
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
      title={submitText + ' Submission'}
      reset={() => {}}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-submission'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Part</FormLabel>
      </FormControl>
      <FormControl fullWidth sx={{ mb: '10px' }}>
        <FormLabel>Submission Name</FormLabel>
        <ReactHookTextField
          control={control}
          name="name"
          errorMessage={errors.name}
          placeholder="Name..."
          sx={{ width: 1 }}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Uploader Notes (optional)</FormLabel>
        <ReactHookTextField
          control={control}
          name="pdmFileName"
          errorMessage={errors.notes}
          placeholder="Any additional comments go here..."
          sx={{ width: 1 }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default ReviewFormView;
