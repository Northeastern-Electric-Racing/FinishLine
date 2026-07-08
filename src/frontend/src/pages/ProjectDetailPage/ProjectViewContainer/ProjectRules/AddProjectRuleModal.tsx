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
import { Rule } from 'shared';
import NERModal from '../../../../components/NERModal';
import { useUnassignedRulesForRuleset } from '../../../../hooks/rules.hooks';

interface AddRuleModalProps {
  open: boolean;
  onHide: () => void;
  rulesetId: string;
  projectId: string;
  teamNames: string[];
  onSubmit: (ruleIds: string[]) => void;
}

const AddRuleModal = ({ open, onHide, rulesetId, projectId, teamNames, onSubmit }: AddRuleModalProps) => {
  const theme = useTheme();

  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]); // Leaf-rule selections that will be submitted
  const [path, setPath] = useState<string[]>([]); // In-progress path (rule ids from top level down); only holds non-leaf rules
  const { data: unassignedRules, isLoading, isError } = useUnassignedRulesForRuleset(rulesetId, projectId);

  const addableRules = useMemo(() => unassignedRules ?? [], [unassignedRules]); // rules that can still be added
  const rulesById = useMemo(
    () => new Map(addableRules.map((rule: Rule) => [rule.ruleId, rule] as [string, Rule])),
    [addableRules]
  );
  const addableRuleIds = useMemo(() => new Set(addableRules.map((rule: Rule) => rule.ruleId)), [addableRules]);

  // only leaves can be submitted
  const isLeaf = (rule: Rule) => rule.subRuleIds.length === 0;
  // used to sort rules in the dropdowns by their rule code
  const byRuleCode = (a: Rule, b: Rule) => a.ruleCode.localeCompare(b.ruleCode, undefined, { numeric: true });

  // Recursively checks if a rule has any unselected leaf descendants.
  const hasUnselectedLeaf = (ruleId: string, selected: string[]): boolean => {
    const rule = rulesById.get(ruleId);
    if (!rule) return false;
    if (isLeaf(rule)) return !selected.includes(ruleId);
    return addableRules.some(
      (child: Rule) => child.parentRule?.ruleId === ruleId && hasUnselectedLeaf(child.ruleId, selected)
    );
  };

  // Finds children of the given parent that still have a leaf left to assign
  // Or if parentId is null finds the top-level rules of each addable branch (has some unassigned leaf rule)
  const optionsForParent = (parentId: string | null, selected: string[] = selectedRuleIds): Rule[] =>
    addableRules
      .filter((rule: Rule) =>
        parentId === null
          ? !rule.parentRule || !addableRuleIds.has(rule.parentRule.ruleId)
          : rule.parentRule?.ruleId === parentId
      )
      .filter((rule: Rule) => hasUnselectedLeaf(rule.ruleId, selected))
      .sort(byRuleCode);

  // One dropdown per level: the top-level rules, then the children of each chosen rule, recursively.
  // The first dropdown will always be the top level options, each selection adds a dropdown for its children, until a leaf is chosen.
  const buildLevels = (): { options: Rule[]; value: string }[] => {
    // Tracks the dropdowns to show, starting with the top-level rules and adding a level for each selected rule in the path.
    const result: { options: Rule[]; value: string }[] = [{ options: optionsForParent(null), value: path[0] ?? '' }];
    // Each rule already chosen in the path adds one more dropdown beneath it, listing that rule's children.
    path.forEach((ruleId, index) => {
      result.push({ options: optionsForParent(ruleId), value: path[index + 1] ?? '' });
    });
    return result;
  };
  const levels = buildLevels();

  // If an addable leaf exists anywhere
  const hasAddableRules = optionsForParent(null).length > 0;

  const handleLevelChange = (levelIndex: number, event: SelectChangeEvent<string>) => {
    const ruleId = event.target.value;
    const rule = rulesById.get(ruleId);
    if (!rule) return;

    if (isLeaf(rule)) {
      // Add the leaf to the selected list if it isn't already there
      const updatedSelected = selectedRuleIds.includes(ruleId) ? selectedRuleIds : [...selectedRuleIds, ruleId];
      setSelectedRuleIds(updatedSelected);
      // Keep the path up to the parent of the leaf so siblings can be added if any exist
      // Collapse levels whose options are now exhausted (no unselected leaves left)
      let newPath = path.slice(0, levelIndex);
      while (newPath.length > 0 && optionsForParent(newPath[newPath.length - 1], updatedSelected).length === 0) {
        newPath = newPath.slice(0, -1);
      }
      setPath(newPath);
    } else {
      setPath([...path.slice(0, levelIndex), ruleId]);
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
    setPath([]); // reset dropdowns
  };

  // Get rule display name
  const getRuleName = (ruleId: string): string => rulesById.get(ruleId)?.ruleCode ?? ruleId;

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
        {isError ? (
          <Alert severity="error">Failed to load rules</Alert>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : // Empty state when there are no rules assigned or nothing addable is left
        addableRules.length === 0 || (!hasAddableRules && selectedRuleIds.length === 0) ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {teamNames.length > 0
              ? `No unassigned rules available for the ${teamNames.join(', ')} team${teamNames.length === 1 ? '' : 's'}.`
              : 'No unassigned rules available for this project.'}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Selected Rules */}
            {selectedRuleIds.length > 0 && (
              <Box>
                <Typography variant="h4" sx={labelStyles}>
                  Selected Rules
                </Typography>
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
                  </Box>
                ))}
              </Box>
            )}

            {/* Continuous dropdowns: start at a top-level rule and pick sub-rules until reaching a leaf */}
            {hasAddableRules ? (
              <Box>
                <Typography variant="h4" sx={labelStyles}>
                  Select Rule
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Non-leaf options are flagged with a › to show the ability to continue selecting */}
                  {levels.map((level, levelIndex) => (
                    <FormControl fullWidth key={levelIndex}>
                      <Select
                        value={level.value}
                        onChange={(event) => handleLevelChange(levelIndex, event)}
                        displayEmpty
                        disabled={level.options.length === 0}
                        sx={selectStyles}
                        MenuProps={{
                          PaperProps: {
                            sx: { backgroundColor: theme.palette.background.paper, maxHeight: 300 }
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          <Typography sx={{ color: theme.palette.text.secondary }}>
                            {levelIndex === 0 ? 'Select Rule' : 'Select Sub-Rule'}
                          </Typography>
                        </MenuItem>
                        {level.options.map((rule: Rule) => (
                          <MenuItem key={rule.ruleId} value={rule.ruleId}>
                            <Box>
                              <Typography fontWeight="bold">
                                {rule.ruleCode}
                                {isLeaf(rule) ? '' : ' ›'}
                              </Typography>
                              {rule.ruleContent && (
                                <Typography
                                  variant="body2"
                                  sx={{ color: theme.palette.text.secondary, maxWidth: 350 }}
                                  noWrap
                                >
                                  {rule.ruleContent}
                                </Typography>
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ))}
                </Box>
              </Box>
            ) : (
              // Every addable leaf has been selected this session, but the Selected Rules list
              // above stays visible with save enabled so the user can submit what they picked
              <Typography variant="body2" color="text.secondary">
                {teamNames.length > 0
                  ? `No more unassigned rules available for the ${teamNames.join(', ')} team${teamNames.length === 1 ? '' : 's'}.`
                  : 'No more unassigned rules available for this project.'}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </NERModal>
  );
};

export default AddRuleModal;
