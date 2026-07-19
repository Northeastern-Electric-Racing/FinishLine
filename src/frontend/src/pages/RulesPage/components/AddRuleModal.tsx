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
  parentRuleCode?: string;
}

interface FormData {
  ruleCode: string;
  ruleContent?: string;
}

const schema = yup.object().shape({
  ruleCode: yup.string().required('Rule Code is required'),
  ruleContent: yup.string()
});

const AddRuleModal: React.FC<AddRuleModalProps> = ({ open, onClose, rulesetId, initialParentRuleId, parentRuleCode }) => {
  const theme = useTheme();
  const toast = useToast();
  const { mutateAsync: createRule } = useCreateRule();

  // Track the hierarchy of selected REFERENCED rules (separate from parent)
  const [selectedReferenceHierarchy, setSelectedReferenceHierarchy] = useState<string[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      ruleCode: '',
      ruleContent: ''
    }
  });

  const watchedRuleCode = watch('ruleCode');
  const showPrefixWarning = !!parentRuleCode && !!watchedRuleCode && !watchedRuleCode.startsWith(parentRuleCode);

  // Reset reference hierarchy and prefill the code field with the parent's code when modal opens
  useEffect(() => {
    if (open) {
      setSelectedReferenceHierarchy([]);
      reset({
        ruleCode: parentRuleCode ? `${parentRuleCode}.` : '',
        ruleContent: ''
      });
    }
  }, [open, initialParentRuleId, parentRuleCode, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const referencedRules =
        selectedReferenceHierarchy.length > 0 ? [selectedReferenceHierarchy[selectedReferenceHierarchy.length - 1]] : [];

      await createRule({
        ruleCode: data.ruleCode,
        ruleContent: data.ruleContent ?? '',
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
          {showPrefixWarning && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography sx={{ color: '#ef4345', fontSize: '0.9rem' }}>
                Note: This code doesn't start with the parent's code '{parentRuleCode}'
              </Typography>
            </Box>
          )}
        </Box>

        {/* Rule Content */}
        <Box>
          <Typography
            variant="h4"
            sx={{ color: theme.palette.primary.main, textDecoration: 'underline', fontSize: 30, mb: 2 }}
          >
            Rule Content
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
