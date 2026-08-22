/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  useTheme
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { ProjectRule } from 'shared';
import NERModal from '../../../../components/NERModal';

interface RemoveRuleModalProps {
  open: boolean;
  onHide: () => void;
  projectRules: ProjectRule[];
  onSubmit: (projectRuleIds: string[]) => void;
}

const RemoveRuleModal = ({ open, onHide, projectRules, onSubmit }: RemoveRuleModalProps) => {
  const theme = useTheme();

  const [selectedProjectRuleIds, setSelectedProjectRuleIds] = useState<string[]>([]);

  // Only leaf rules (rules with no children currently assigned to this project) can be removed directly.
  // Ancestor rules are auto-managed by the backend when their leaf descendants are added/removed.
  const removableProjectRules = useMemo(() => {
    const parentRuleIds = new Set(
      projectRules.map((pr) => pr.rule.parentRule?.ruleId).filter((id): id is string => !!id)
    );
    return projectRules.filter((pr) => !parentRuleIds.has(pr.rule.ruleId));
  }, [projectRules]);

  const projectRulesById = useMemo(
    () => new Map(removableProjectRules.map((pr) => [pr.projectRuleId, pr] as [string, ProjectRule])),
    [removableProjectRules]
  );

  const availableOptions = removableProjectRules
    .filter((pr) => !selectedProjectRuleIds.includes(pr.projectRuleId))
    .sort((a, b) => a.rule.ruleCode.localeCompare(b.rule.ruleCode, undefined, { numeric: true }));

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const projectRuleId = event.target.value;
    if (!projectRuleId) return;
    setSelectedProjectRuleIds((prev) => [...prev, projectRuleId]);
  };

  const handleRemoveSelection = (projectRuleId: string) => {
    setSelectedProjectRuleIds((prev) => prev.filter((id) => id !== projectRuleId));
  };

  const resetForm = () => {
    setSelectedProjectRuleIds([]);
  };

  const handleSubmit = () => {
    onSubmit(selectedProjectRuleIds);
    resetForm();
    onHide();
  };

  const handleClose = () => {
    resetForm();
    onHide();
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

  const labelStyles = {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    fontSize: '2rem',
    mb: '10px'
  };

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
      title="Remove Rule"
      onSubmit={handleSubmit}
      submitText="Delete"
      disabled={selectedProjectRuleIds.length === 0}
    >
      <Box sx={{ minWidth: 400 }}>
        {removableProjectRules.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No rules available to remove from this project.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectedProjectRuleIds.length > 0 && (
              <Box>
                <Typography variant="h4" sx={labelStyles}>
                  Selected Rules
                </Typography>
                {selectedProjectRuleIds.map((projectRuleId) => (
                  <Box key={projectRuleId} sx={selectedRuleStyles}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveSelection(projectRuleId)}
                        sx={{ color: theme.palette.text.primary, p: 0.5, mr: 1 }}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ color: theme.palette.text.primary }}>
                        {projectRulesById.get(projectRuleId)?.rule.ruleCode ?? projectRuleId}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {availableOptions.length > 0 ? (
              <Box>
                <Typography variant="h4" sx={labelStyles}>
                  Select Rule
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value=""
                    onChange={handleSelectChange}
                    displayEmpty
                    sx={selectStyles}
                    MenuProps={{
                      PaperProps: {
                        sx: { backgroundColor: theme.palette.background.paper, maxHeight: 300 }
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: theme.palette.text.secondary }}>Select Rule</Typography>
                    </MenuItem>
                    {availableOptions.map((projectRule) => (
                      <MenuItem key={projectRule.projectRuleId} value={projectRule.projectRuleId}>
                        <Box>
                          <Typography fontWeight="bold">{projectRule.rule.ruleCode}</Typography>
                          {projectRule.rule.ruleContent && (
                            <Typography
                              variant="body2"
                              sx={{ color: theme.palette.text.secondary, maxWidth: 350 }}
                              noWrap
                            >
                              {projectRule.rule.ruleContent}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              selectedProjectRuleIds.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  All removable rules for this project have been selected.
                </Typography>
              )
            )}
          </Box>
        )}
      </Box>
    </NERModal>
  );
};

export default RemoveRuleModal;
