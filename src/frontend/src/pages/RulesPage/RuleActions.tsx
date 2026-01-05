/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { Close, Save } from '@mui/icons-material';

interface RuleActionsProps {
  ruleId: string;
  onAdd: (ruleId: string, anchorEl: HTMLElement) => void;
  onRemove: (ruleId: string) => void;
  onEdit: (ruleId: string) => void;
  onSave?: (ruleId: string) => void;
  onCancel?: (ruleId: string) => void;
  iconColor?: string;
  isEditing?: boolean;
}

/**
 * RuleActions component for displaying actions for a rule.
 * Supports adding, removing, and editing a rule.
 */
const RuleActions: React.FC<RuleActionsProps> = ({
  ruleId,
  onAdd,
  onRemove,
  onEdit,
  onSave,
  onCancel,
  iconColor = '#000000',
  isEditing = false
}) => {
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton onClick={() => onSave?.(ruleId)}>
          <Save />
        </IconButton>
        <IconButton onClick={() => onCancel?.(ruleId)}>
          <Close />
        </IconButton>
      </Box>
    );
  }
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
