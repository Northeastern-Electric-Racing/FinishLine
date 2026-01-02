import { Box, Typography } from '@mui/material';
import { useToast } from '../../../hooks/toasts.hooks';
import NERFormModal from '../../../components/NERFormModal';
import { useForm } from 'react-hook-form';

interface AddRuleModalProps {
  open: boolean;
  onClose: () => void;
}

const AddRuleModal: React.FC<AddRuleModalProps> = ({ open, onClose }) => {
  const toast = useToast();

  const { handleSubmit, reset } = useForm({ defaultValues: {} });

  const onSubmit = async () => {
    toast.success('Add Rule submitted (placeholder)');
    onClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={onClose}
      reset={() => reset({})}
      title="Add Rule"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="add-rule-form"
      showCloseButton
    >
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This is a temporary placeholder modal for creating a new rule. The full rule creation form will be implemented
          later.
        </Typography>
      </Box>
    </NERFormModal>
  );
};

export default AddRuleModal;
