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

  // // Fetch top-level rules
  // const { data: topLevelRules = [], isLoading: topLevelLoading } = useGetTopLevelRules(rulesetId);

  // // Get the children of the most recently selected rule (if any)
  // const lastSelectedRuleId = selectedReferenceHierarchy[selectedReferenceHierarchy.length - 1];
  // const { data: currentChildRules = [] } = useGetChildRules(
  //   lastSelectedRuleId || '',
  //   !!lastSelectedRuleId // only fetch if we have a selected rule
  // );

  const onSubmit = async (data: FormData) => {
    try {
      // Parent rule is ALWAYS the initialParentRuleId - it never changes
      // Referenced rules are the ones selected in the dropdowns (optional)
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

  // const handleReferenceSelect = (level: number) => (event: SelectChangeEvent<string>) => {
  //   const selectedRuleId = event.target.value;

  //   // Update reference hierarchy - keep rules up to this level, add/replace at current level
  //   // This automatically truncates any selections below this level
  //   const newHierarchy = [...selectedReferenceHierarchy.slice(0, level), selectedRuleId];
  //   setSelectedReferenceHierarchy(newHierarchy);
  // };

  // Styling
  // const selectStyles = {
  //   backgroundColor: theme.palette.action.hover,
  //   borderRadius: '8px',
  //   color: theme.palette.text.primary,
  //   '& .MuiSelect-select': {
  //     py: 1.5,
  //     px: 2.5
  //   },
  //   '& .MuiOutlinedInput-notchedOutline': {
  //     border: 'none'
  //   },
  //   '& .MuiSvgIcon-root': {
  //     color: theme.palette.text.primary
  //   }
  // };

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

        {/* Select Referenced Rule - Cascading Dropdowns (OPTIONAL) */}
        {/*
        <Box>
          <Typography
            variant="h4"
            sx={{ color: theme.palette.primary.main, textDecoration: 'underline', fontSize: 30, mb: 2 }}
          >
            Select Referenced Rule
            </Typography>

          {/* Level 0: Top-level rules */}
        {/* <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              value={selectedReferenceHierarchy[0] || ''}
              onChange={handleReferenceSelect(0)}
              displayEmpty
              disabled={topLevelLoading}
              sx={selectStyles}
              MenuProps={{
                PaperProps: {
                  sx: { backgroundColor: theme.palette.background.paper }
                }
              }}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ color: theme.palette.text.secondary }}>Select Sub-Section</Typography>
              </MenuItem>
              {topLevelRules.map((rule: Rule) => (
                <MenuItem key={rule.ruleId} value={rule.ruleId}>
                  {rule.ruleCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}

        {/* Dynamic child rule dropdown - only show one level at a time */}
        {/*
          {selectedReferenceHierarchy.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedReferenceHierarchy[selectedReferenceHierarchy.length] || ''}
                onChange={handleReferenceSelect(selectedReferenceHierarchy.length)}
                displayEmpty
                sx={selectStyles}
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: theme.palette.background.paper }
                  }
                }}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{ color: theme.palette.text.secondary }}>Select Sub-Section</Typography>
                </MenuItem>
                {currentChildRules.map((rule: Rule) => (
                  <MenuItem key={rule.ruleId} value={rule.ruleId}>
                    {rule.ruleCode}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box> */}
      </Box>
    </NERFormModal>
  );
};

export default AddRuleModal;
