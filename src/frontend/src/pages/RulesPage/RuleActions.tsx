/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';

interface RuleActionsProps {
  ruleId: string;
  onAdd: (ruleId: string, anchorEl: HTMLElement) => void;
  onRemove: (ruleId: string) => void;
  onEdit: (ruleId: string) => void;
  iconColor?: string;
}

/**
 * RuleActions component for displaying actions for a rule.
 * Supports adding, removing, and editing a rule.
 */
const RuleActions: React.FC<RuleActionsProps> = ({ ruleId, onAdd, onRemove, onEdit, iconColor = '#000000' }) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', justifyContent: 'center' }}>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(ruleId, e.currentTarget);
        }}
        sx={{ padding: 0.25, color: iconColor }}
      >
        <AddCircleOutlineIcon fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(ruleId);
        }}
        sx={{ padding: 0.25, color: iconColor }}
      >
        <RemoveCircleOutlineIcon fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(ruleId);
        }}
        sx={{ padding: 0.25, color: iconColor }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default RuleActions;
