import { useState, useEffect } from 'react';
import { Box, Typography, TextField, FormControl, FormLabel, FormHelperText } from '@mui/material';
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
  ruleCode: yup
    .string()
    .required('Rule Code is required')
    .test('not-blank', 'Rule Code is required', (value) => !!value?.trim()),
  ruleContent: yup.string()
});

const sectionHeaderStyle = {
  display: 'block',
  fontWeight: 'bold',
  color: '#ef4345',
  textDecoration: 'underline',
  fontSize: '1rem',
  textUnderlineOffset: '5px',
  marginBottom: '10px'
};

const AddRuleModal: React.FC<AddRuleModalProps> = ({ open, onClose, rulesetId, initialParentRuleId, parentRuleCode }) => {
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

  // Prefill code field with the parent's code when modal opens
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
    const referencedRules =
      selectedReferenceHierarchy.length > 0 ? [selectedReferenceHierarchy[selectedReferenceHierarchy.length - 1]] : [];

    // only resets the draft on success
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
  };

  const handleClose = () => {
    setSelectedReferenceHierarchy([]);
    onClose();
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '500px' }}>
        {/* Rule Code */}
        <FormControl fullWidth error={!!errors.ruleCode}>
          <FormLabel sx={sectionHeaderStyle}>Rule Code*</FormLabel>
          <Controller
            name="ruleCode"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth placeholder="Enter Rule Code" error={!!errors.ruleCode} />
            )}
          />
          <FormHelperText error={!!errors.ruleCode}>{errors.ruleCode?.message}</FormHelperText>
          {showPrefixWarning && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography sx={{ color: '#ef4345', fontSize: '0.9rem' }}>
                Note: Rule Code should start with '{parentRuleCode}' to match parent code
              </Typography>
            </Box>
          )}
        </FormControl>

        {/* Rule Content */}
        <FormControl fullWidth error={!!errors.ruleContent}>
          <FormLabel sx={sectionHeaderStyle}>Rule Content</FormLabel>
          <Controller
            name="ruleContent"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth placeholder="Enter Rule Content" error={!!errors.ruleContent} />
            )}
          />
          <FormHelperText error={!!errors.ruleContent}>{errors.ruleContent?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default AddRuleModal;
