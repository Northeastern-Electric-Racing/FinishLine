/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  useTheme
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Rule } from 'shared';
import NERModal from '../../../../components/NERModal';
import { useUnassignedRulesForRuleset } from '../../../../hooks/rules.hooks';

interface AddRuleModalProps {
  open: boolean;
  onHide: () => void;
  rulesetId: string;
  teamId: string;
  teamName: string;
  onSubmit: (ruleIds: string[]) => void;
}

const AddRuleModal = ({ open, onHide, rulesetId, teamId, teamName, onSubmit }: AddRuleModalProps) => {
  const theme = useTheme();
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  const { data: unassignedRules, isLoading, isError } = useUnassignedRulesForRuleset(rulesetId, teamId);

  type ParentInfo = { ruleId: string; ruleCode: string };

  const uniqueParents = useMemo(() => {
    if (!unassignedRules) return [];
    const parentMap = new Map<string, ParentInfo>();
    unassignedRules.forEach((rule: Rule) => {
      if (rule.parentRule) {
        parentMap.set(rule.parentRule.ruleId, rule.parentRule);
      }
    });
    return Array.from(parentMap.values()).sort((a, b) => a.ruleCode.localeCompare(b.ruleCode));
  }, [unassignedRules]);

  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const availableRules = useMemo(() => {
    if (!unassignedRules || !selectedParentId) return [];
    return unassignedRules.filter((rule: Rule) => rule.parentRule?.ruleId === selectedParentId);
  }, [unassignedRules, selectedParentId]);

  const handleParentChange = (event: SelectChangeEvent<string>) => {
    setSelectedParentId(event.target.value);
    setSelectedRuleIds([]);
  };

  const handleRuleSelect = (event: SelectChangeEvent<string>) => {
    const ruleId = event.target.value;
    if (ruleId && !selectedRuleIds.includes(ruleId)) {
      setSelectedRuleIds((prev) => [...prev, ruleId]);
    }
  };

  const handleRemoveRule = (ruleId: string) => {
    setSelectedRuleIds((prev) => prev.filter((id) => id !== ruleId));
  };

  const handleSubmit = () => {
    onSubmit(selectedRuleIds);
    resetForm();
    onHide();
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const resetForm = () => {
    setSelectedRuleIds([]);
    setSelectedParentId('');
  };

  // Get rule display name
  const getRuleName = (ruleId: string): string => {
    const rule = unassignedRules?.find((r: Rule) => r.ruleId === ruleId);
    return rule ? rule.ruleCode : ruleId;
  };

  // Dropdown styling
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

  const labelStyles = {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    fontSize: '2rem',
    mb: '10px'
  };

  // Selected rule row styling
  const selectedRuleStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.action.hover,
    borderRadius: '8px',
    px: 2.5,
    py: 1.5,
    mb: 1.5
  };

  return (
    <NERModal
      open={open}
      onHide={handleClose}
      title="Add Rule"
      onSubmit={handleSubmit}
      submitText="Save"
      disabled={selectedRuleIds.length === 0}
    >
      <Box sx={{ minWidth: 400 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">Failed to load rules</Alert>
        ) : !unassignedRules || unassignedRules.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No unassigned rules available for the {teamName} team.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Select Section */}
            <Box>
              <Typography variant="h4" sx={labelStyles}>
                Select Section
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedParentId}
                  onChange={handleParentChange}
                  displayEmpty
                  disabled={uniqueParents.length === 0}
                  sx={selectStyles}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: theme.palette.background.paper }
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{ color: theme.palette.text.secondary }}>Select Section</Typography>
                  </MenuItem>
                  {uniqueParents.map((parent) => (
                    <MenuItem key={parent.ruleId} value={parent.ruleId}>
                      {parent.ruleCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Select Rules */}
            <Box>
              <Typography variant="h4" sx={labelStyles}>
                Select Rules
              </Typography>

              {/* Selected Rules */}
              {selectedRuleIds.map((ruleId) => (
                <Box key={ruleId} sx={selectedRuleStyles}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRule(ruleId)}
                      sx={{ color: theme.palette.text.primary, p: 0.5, mr: 1 }}
                    >
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ color: theme.palette.text.primary }}>{getRuleName(ruleId)}</Typography>
                  </Box>
                  <KeyboardArrowDownIcon sx={{ color: theme.palette.text.primary }} />
                </Box>
              ))}

              {/* Add Subtask dropdown */}
              <FormControl fullWidth>
                <Select
                  value=""
                  onChange={handleRuleSelect}
                  displayEmpty
                  disabled={!selectedParentId}
                  sx={selectStyles}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: '#3a3a3a', maxHeight: 300 }
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{ color: theme.palette.text.secondary }}>Add Subtask</Typography>
                  </MenuItem>
                  {availableRules
                    .filter((rule: Rule) => !selectedRuleIds.includes(rule.ruleId))
                    .map((rule: Rule) => (
                      <MenuItem key={rule.ruleId} value={rule.ruleId}>
                        <Box>
                          <Typography fontWeight="bold">{rule.ruleCode}</Typography>
                          {rule.ruleContent && (
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxWidth: 350 }} noWrap>
                              {rule.ruleContent}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}
      </Box>
    </NERModal>
  );
};

export default AddRuleModal;
