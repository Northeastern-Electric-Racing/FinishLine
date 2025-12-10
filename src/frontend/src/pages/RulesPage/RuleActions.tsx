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
  onAdd: (ruleId: string) => void;
  onRemove: (ruleId: string) => void;
  onEdit: (ruleId: string) => void;
  iconColor?: string;
}

/**
 * RuleActions component for displaying actions for a rule.
 * Supports adding, removing, and editing a rule.
 */
const RuleActions: React.FC<RuleActionsProps> = ({ ruleId, onAdd, onRemove, onEdit, iconColor = '#000000' }) => {
  const actions = [
    { icon: <AddCircleOutlineIcon fontSize="small" />, handler: onAdd },
    { icon: <RemoveCircleOutlineIcon fontSize="small" />, handler: onRemove },
    { icon: <EditIcon fontSize="small" />, handler: onEdit }
  ];

  return (
    <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', justifyContent: 'center' }}>
      {actions.map((action, index) => (
        <IconButton
          key={index}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            action.handler(ruleId);
          }}
          sx={{ padding: 0.25, color: iconColor }}
        >
          {action.icon}
        </IconButton>
      ))}
    </Box>
  );
};

export default RuleActions;
