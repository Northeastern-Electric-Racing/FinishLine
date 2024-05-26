import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import AssemblyFormView from './AssemblyFormView';

const schema = yup.object().shape({
  name: yup.string().required(),
  pdmFileName: yup.string().optional()
});

export interface AssemblyFormInput {
  name: string;
  pdmFileName?: string;
}

export interface AssemblyFormProps {
  submitText: 'Add' | 'Edit';
  onSubmit: (payload: AssemblyFormInput) => void;
  defaultValues?: AssemblyFormInput;
  onHide: () => void;
  open: boolean;
}

const AssemblyForm: React.FC<AssemblyFormProps> = ({ submitText, onSubmit, defaultValues, onHide, open }) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<AssemblyFormInput>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      pdmFileName: defaultValues?.pdmFileName
    },
    resolver: yupResolver(schema)
  });

  return (
    <AssemblyFormView
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      submitText={submitText}
      onHide={onHide}
      control={control}
      errors={errors}
      open={open}
    />
  );
};

export default AssemblyForm;
