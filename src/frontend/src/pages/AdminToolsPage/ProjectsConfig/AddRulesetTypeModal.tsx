import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';

interface RulesetTypeFormData {
  name: string;
}

interface AddRulesetTypeModalProps {
  open: boolean;
  onHide: () => void;
  onFormSubmit: (data: RulesetTypeFormData) => Promise<void>;
}

const schema = yup.object({
  name: yup.string().required('Name is required')
});

const AddRulesetTypeModal: React.FC<AddRulesetTypeModalProps> = ({ open, onHide, onFormSubmit }) => {
  const toast = useToast();

  const {
    formState: { errors },
    handleSubmit,
    reset,
    control
  } = useForm<RulesetTypeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: ''
    }
  });

  const handleFormSubmit = async (data: RulesetTypeFormData) => {
    try {
      await onFormSubmit(data);
      toast.success('Ruleset Type Successfully Added');
      reset();
      onHide();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleModalClose = () => {
    reset();
    onHide();
  };

  const handleReset = () => {
    reset();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleModalClose}
      title="Add Ruleset Type"
      reset={handleReset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleFormSubmit}
      formId={'add-ruleset-type-form'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Ruleset Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default AddRulesetTypeModal;
