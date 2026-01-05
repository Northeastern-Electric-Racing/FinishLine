import { useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, SelectChangeEvent, useTheme, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCreateRule } from '../../../hooks/rules.hooks';
import { useGetTopLevelRules, useGetChildRules } from '../../../hooks/rules.hooks';
import { Rule } from 'shared';

interface AddRuleModalProps {
  open: boolean;
  onClose: () => void;
  rulesetId: string;
}

interface FormData {
  ruleCode: string;
  ruleContent: string;
  parentRuleId?: string;
}

const schema = yup.object().shape({
  ruleCode: yup.string().required('Rule Code is required!'),
  ruleContent: yup.string().required('Rule Content is required!'),
  parentRuleId: yup.string().optional()
});

const AddRuleModal: React.FC<AddRuleModalProps> = ({ open, onClose, rulesetId }) => {
  const theme = useTheme();
  const toast = useToast();
  const { mutateAsync: createRule } = useCreateRule();

  // Track the hierarchy of selected rules
  const [selectedRuleHierarchy, setSelectedRuleHierarchy] = useState<string[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      ruleCode: '',
      ruleContent: '',
      parentRuleId: undefined
    }
  });

  // Fetch top-level rules
  const { data: topLevelRules = [], isLoading: topLevelLoading } = useGetTopLevelRules(rulesetId);

  // Dynamically fetch children for each level in the hierarchy
  const childRulesQueries = selectedRuleHierarchy.map((ruleId, index) =>
    useGetChildRules(ruleId, index === selectedRuleHierarchy.length - 1)
  );

  const onSubmit = async (data: FormData) => {
    try {
      const parentRuleId = selectedRuleHierarchy[selectedRuleHierarchy.length - 1] || undefined;
      
      await createRule({
        ruleCode: data.ruleCode,
        ruleContent: data.ruleContent,
        rulesetId,
        parentRuleId,
        referencedRules: [],
        imageFileIds: []
      });

      toast.success('Rule created successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to create rule');
      console.error('Error creating rule:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedRuleHierarchy([]);
    onClose();
  };

  const handleRuleSelect = (level: number) => (event: SelectChangeEvent<string>) => {
    const selectedRuleId = event.target.value;
    
    // Update hierarchy - keep rules up to this level, replace current level
    const newHierarchy = [...selectedRuleHierarchy.slice(0, level), selectedRuleId];
    setSelectedRuleHierarchy(newHierarchy);
  };

  // Styling
  const labelStyles = {
    color: '#ef4345',
    fontWeight: 700,
    textDecoration: 'underline',
    fontSize: '20px',
    mb: 1.5
  };

  const selectStyles = {
    backgroundColor: theme.palette.action.hover,
    borderRadius: '8px',
    color: theme.palette.text.primary,
    '& .MuiSelect-select': {
      py: 1.5,
      px: 2.5
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.text.primary
    }
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

  // Get rules for current level
  const getCurrentLevelRules = (level: number): Rule[] => {
    if (level === 0) {
      return topLevelRules;
    }
    
    const queryResult = childRulesQueries[level - 1];
    return queryResult?.data || [];
  };

  // Check if current level has child rules
  const hasChildRules = (level: number): boolean => {
    if (level >= selectedRuleHierarchy.length) return false;
    const rules = getCurrentLevelRules(level + 1);
    return rules.length > 0;
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      reset={() => {
        reset();
        setSelectedRuleHierarchy([]);
      }}
      title="Add Rule"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="add-rule-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
        {/* Rule Code */}
        <Box>
          <Typography sx={labelStyles}>Rule Code*</Typography>
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
          <Typography sx={labelStyles}>Rule Content*</Typography>
          <Controller
            name="ruleContent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={3}
                placeholder="Enter Rule Content"
                error={!!errors.ruleContent}
                helperText={errors.ruleContent?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>

        {/* Select Referenced Rule - Cascading Dropdowns */}
        <Box>
          <Typography sx={labelStyles}>Select Referenced Rule</Typography>

          {/* Level 0: Top-level rules */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              value={selectedRuleHierarchy[0] || ''}
              onChange={handleRuleSelect(0)}
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
          </FormControl>

          {/* Dynamic child rule dropdowns */}
          {selectedRuleHierarchy.map((selectedRuleId, level) => {
            const childRules = getCurrentLevelRules(level + 1);
            const shouldShow = childRules.length > 0;

            if (!shouldShow) return null;

            return (
              <FormControl key={`level-${level + 1}`} fullWidth sx={{ mb: 2 }}>
                <Select
                  value={selectedRuleHierarchy[level + 1] || ''}
                  onChange={handleRuleSelect(level + 1)}
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
                  {childRules.map((rule: Rule) => (
                    <MenuItem key={rule.ruleId} value={rule.ruleId}>
                      {rule.ruleCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          })}
        </Box>
      </Box>
    </NERFormModal>
  );
};

export default AddRuleModal;