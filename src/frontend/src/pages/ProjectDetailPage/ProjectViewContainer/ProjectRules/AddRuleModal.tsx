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
  onSubmit: (ruleIds: string[]) => void;
}

const AddRuleModal = ({ open, onHide, rulesetId, teamId, onSubmit }: AddRuleModalProps) => {
  const theme = useTheme();
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubSection1, setSelectedSubSection1] = useState<string>('');
  const [selectedSubSection2, setSelectedSubSection2] = useState<string>('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  const { data: unassignedRules, isLoading, isError } = useUnassignedRulesForRuleset(rulesetId, teamId);

  // Get top-level sections (rules without parent)
  const sections = useMemo(() => {
    if (!unassignedRules) return [];
    return unassignedRules.filter((rule: Rule) => !rule.parentRule);
  }, [unassignedRules]);

  // Get sub-sections based on selected section
  const subSections1 = useMemo(() => {
    if (!unassignedRules || !selectedSection) return [];
    return unassignedRules.filter((rule: Rule) => rule.parentRule?.ruleId === selectedSection);
  }, [unassignedRules, selectedSection]);

  // Get sub-sub-sections based on selected sub-section
  const subSections2 = useMemo(() => {
    if (!unassignedRules || !selectedSubSection1) return [];
    return unassignedRules.filter((rule: Rule) => rule.parentRule?.ruleId === selectedSubSection1);
  }, [unassignedRules, selectedSubSection1]);

  // Get leaf rules based on selected sub-sub-section (or sub-section if no sub-sub-sections)
  const leafRules = useMemo(() => {
    if (!unassignedRules) return [];
    const parentId = selectedSubSection2 || selectedSubSection1 || selectedSection;
    if (!parentId) return [];
    return unassignedRules.filter((rule: Rule) => rule.parentRule?.ruleId === parentId && rule.subRuleIds.length === 0);
  }, [unassignedRules, selectedSection, selectedSubSection1, selectedSubSection2]);

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    setSelectedSection(event.target.value);
    setSelectedSubSection1('');
    setSelectedSubSection2('');
    setSelectedRuleIds([]);
  };

  const handleSubSection1Change = (event: SelectChangeEvent<string>) => {
    setSelectedSubSection1(event.target.value);
    setSelectedSubSection2('');
    setSelectedRuleIds([]);
  };

  const handleSubSection2Change = (event: SelectChangeEvent<string>) => {
    setSelectedSubSection2(event.target.value);
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
    setSelectedSection('');
    setSelectedSubSection1('');
    setSelectedSubSection2('');
    setSelectedRuleIds([]);
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
    color: '#ef4345',
    fontWeight: 700,
    textDecoration: 'underline',
    fontSize: '20px',
    mb: 1.5
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
            No unassigned rules available for this team.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Select Section */}
            <Box>
              <Typography sx={labelStyles}>Select Section</Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  displayEmpty
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
                  {sections.map((section: Rule) => (
                    <MenuItem key={section.ruleId} value={section.ruleId}>
                      {section.ruleCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Select Sub-Section 1 */}
            <Box>
              <Typography sx={labelStyles}>Select Sub-Section</Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedSubSection1}
                  onChange={handleSubSection1Change}
                  displayEmpty
                  disabled={!selectedSection || subSections1.length === 0}
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
                  {subSections1.map((subSection: Rule) => (
                    <MenuItem key={subSection.ruleId} value={subSection.ruleId}>
                      {subSection.ruleCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Select Sub-Section 2 */}
            <Box>
              <Typography sx={labelStyles}>Select Sub-Section</Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedSubSection2}
                  onChange={handleSubSection2Change}
                  displayEmpty
                  disabled={!selectedSubSection1 || subSections2.length === 0}
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
                  {subSections2.map((subSection: Rule) => (
                    <MenuItem key={subSection.ruleId} value={subSection.ruleId}>
                      {subSection.ruleCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Select Rules */}
            <Box>
              <Typography sx={labelStyles}>Select Rules</Typography>

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
                  disabled={!selectedSection}
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
                  {leafRules
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
