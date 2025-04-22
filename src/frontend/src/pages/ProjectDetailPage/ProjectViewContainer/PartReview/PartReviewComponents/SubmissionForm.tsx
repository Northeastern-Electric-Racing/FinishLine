import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import SubmissionFormView from './SubmissionFormView';
import { usePartsFromProject } from '../../../../../hooks/part-review.hooks';

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
  wbsNum: string;
}

const schema = yup.object().shape({
  partId: yup.string().required('Select a Part!'),
  name: yup.string().required('Enter a Submission Name!'),
  fileIds: yup.array().of(yup.string().defined()).required(),
  notes: yup.string().optional()
});

const SubmissionForm: React.FC<SubmissionFormProps> = ({ submitText, onSubmit, defaultValues, onHide, open }) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset
  } = useForm<SubmissionFormInput>({
    defaultValues: {
      partId: defaultValues?.partId ?? '',
      fileIds: defaultValues?.fileIds ?? [],
      name: defaultValues?.name ?? '',
      notes: defaultValues?.notes ?? ''
    },
    resolver: yupResolver(schema)
  });

  const { data: parts, isLoading: isLoadingParts, isError: partsIsError, error: partsError } = usePartsFromProject(wbsNum);

  return (
    <SubmissionFormView
      onSubmit={onSubmit}
      allParts={allParts}
      handleSubmit={handleSubmit}
      submitText={submitText}
      onHide={onHide}
      control={control}
      errors={errors}
      open={open}
      setValue={setValue}
      reset={reset}
    />
  );
};

export default SubmissionForm;
