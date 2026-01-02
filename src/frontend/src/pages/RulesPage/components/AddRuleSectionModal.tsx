import { Box, Typography } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { useForm } from 'react-hook-form';

interface AddRuleSectionModalProps {
  open: boolean;
  onClose: () => void;
}

const AddRuleSectionModal: React.FC<AddRuleSectionModalProps> = ({ open, onClose }) => {
  const toast = useToast();

  const { handleSubmit, reset } = useForm({ defaultValues: {} });

  const onSubmit = async () => {
    toast.success('Add Rule Section submitted (placeholder)');
    onClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={onClose}
      reset={() => reset({})}
      title="Add Rule Section"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="add-rule-section-form"
      showCloseButton
    >
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This is a temporary placeholder modal for creating a new rule section. Form fields will be added in a future
          ticket.
        </Typography>
      </Box>
    </NERFormModal>
  );
};

export default AddRuleSectionModal;
