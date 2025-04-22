import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { PartTag } from 'shared';
import PartFormView from './PartFormView';

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
const schema = yup.object().shape({
  index: yup.string().required('Enter an index!'),
  commonName: yup.string().required('Enter a Part Common Name!'),
  description: yup.string().optional(),
  tags: yup.string().optional(), //fix
  assignees: yup.string().optional(), //fix
  reviewers: yup.string().optional() //fix
});

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
      reviewers: defaultValues?.reviewers ?? []
    },
    resolver: yupResolver(schema)
  });

  const {
    data: manufactuers,
    isLoading: isLoadingManufactuers,
    isError: manufacturersIsError,
    error: manufacturersError
  } = useGetAllPartTags();

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
export default PartForm;
