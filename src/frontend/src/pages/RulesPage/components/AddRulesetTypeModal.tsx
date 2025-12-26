import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import { Box } from '@mui/system';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { useToast } from '../../../hooks/toasts.hooks';

interface RulesetTypeFormData {
  name: string;
}

interface AddRulesetTypeModalProps {
  open: boolean;
  onHide: () => void;
  onFormSubmit: (data: RulesetTypeFormData) => Promise<void>;
}

const sectionHeaderStyle = {
  fontWeight: 'bold',
  color: '#ef4345',
  textDecoration: 'underline',
  fontSize: '1rem',
  textUnderlineOffset: '5px',
  marginBottom: '10px'
};

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
      <Box>
        <FormControl fullWidth error={!!errors.name}>
          <FormLabel sx={sectionHeaderStyle}>Name Ruleset:</FormLabel>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoComplete="off"
                placeholder="Name Ruleset"
                error={!!errors.name}
                fullWidth
                sx={{ minWidth: '400px' }}
              />
            )}
          />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default AddRulesetTypeModal;
