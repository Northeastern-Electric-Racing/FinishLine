import { useState, useEffect } from 'react';
import { Box, Typography, useTheme, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCreateRule } from '../../../hooks/rules.hooks';

interface AddRuleModalProps {
  open: boolean;
  onClose: () => void;
  rulesetId: string;
  initialParentRuleId?: string;
}

interface FormData {
  ruleCode: string;
  ruleContent: string;
}

const schema = yup.object().shape({
  ruleCode: yup.string().required('Rule Code is required'),
  ruleContent: yup.string().required('Rule Content is required')
});

const AddRuleModal: React.FC<AddRuleModalProps> = ({ open, onClose, rulesetId, initialParentRuleId }) => {
  const theme = useTheme();
  const toast = useToast();
  const { mutateAsync: createRule } = useCreateRule();

  // Track the hierarchy of selected REFERENCED rules (separate from parent)
  const [selectedReferenceHierarchy, setSelectedReferenceHierarchy] = useState<string[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      ruleCode: '',
      ruleContent: ''
    }
  });

  // Reset reference hierarchy when modal opens/closes or parent changes
  useEffect(() => {
    if (open) {
      setSelectedReferenceHierarchy([]);
    }
  }, [open, initialParentRuleId]);

  const onSubmit = async (data: FormData) => {
    try {
      const referencedRules =
        selectedReferenceHierarchy.length > 0 ? [selectedReferenceHierarchy[selectedReferenceHierarchy.length - 1]] : [];

      await createRule({
        ruleCode: data.ruleCode,
        ruleContent: data.ruleContent,
        rulesetId,
        parentRuleId: initialParentRuleId,
        referencedRules,
        imageFileIds: []
      });

      toast.success('Rule created successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to create rule');
    }
  };

  const handleClose = () => {
    setSelectedReferenceHierarchy([]);
    onClose();
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.action.hover,
      borderRadius: '8px',
      '& fieldset': {
        border: 'none'
      },
      '&:hover fieldset': {
        border: 'none'
      },
      '&.Mui-focused fieldset': {
        border: 'none'
      }
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
      py: 1.5,
      px: 2.5
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      reset={() => {
        reset();
        setSelectedReferenceHierarchy([]);
      }}
      title="Add Rule"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="add-rule-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2, minWidth: '500px' }}>
        {/* Rule Code */}
        <Box>
          <Typography
            variant="h4"
            sx={{ color: theme.palette.primary.main, textDecoration: 'underline', fontSize: 30, mb: 2 }}
          >
            Rule Code*
          </Typography>
          <Controller
            name="ruleCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter Rule Code"
                error={!!errors.ruleCode}
                helperText={errors.ruleCode?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>

        {/* Rule Content */}
        <Box>
          <Typography
            variant="h4"
            sx={{ color: theme.palette.primary.main, textDecoration: 'underline', fontSize: 30, mb: 2 }}
          >
            Rule Content*
          </Typography>
          <Controller
            name="ruleContent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter Rule Content"
                error={!!errors.ruleContent}
                helperText={errors.ruleContent?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>
      </Box>
    </NERFormModal>
  );
};

export default AddRuleModal;
