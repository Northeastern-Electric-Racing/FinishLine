import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import SubmissionFormView from './SubmissionFormView';

const schema = yup.object().shape({
  partId: yup.string().required('Select a Part!'),
  name: yup.string().required('Enter a Submission Name!'),
  fileIds: yup.array().of(yup.string().defined()).required(), //????
  notes: yup.string().optional()
});

export interface SubmissionFormInput {
  partId: string;
  fileIds: string[];
  name: string;
  notes?: string;
}

export interface SubmissionFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: SubmissionFormInput) => void;
  defaultValues?: SubmissionFormInput;
  onHide: () => void;
  open: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ submitText, onSubmit, defaultValues, onHide, open }) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<SubmissionFormInput>({
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
  } = useGetAllParts();

  return (
    <SubmissionFormView
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

export default SubmissionForm;
