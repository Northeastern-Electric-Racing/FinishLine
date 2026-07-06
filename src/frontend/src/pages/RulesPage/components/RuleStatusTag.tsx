/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, IconButton, Tooltip } from '@mui/material';
import { InfoOutlined, KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import { Rule } from 'shared';
import { getRuleStatusConfig, isRuleComplete } from '../../../utils/rules.utils';

interface RuleStatusTagProps {
  rule: Rule;
  allRules: Rule[];
  // ability to update completion status
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  // controls chevron direction when completion is interactive
  popoverOpen?: boolean;
}

/**
 * Completion status chip for a rule.
 * A leaf shows its own completion, while a parent is only complete if all
 * of its descendant leaf rules are complete. Completed leafs also show an
 * info tooltip with who completed it and in which project.
 */
const RuleStatusTag: React.FC<RuleStatusTagProps> = ({ rule, allRules, onClick, popoverOpen = false }) => {
  const isComplete = isRuleComplete(rule, allRules);
  const { label, color } = getRuleStatusConfig(isComplete);

  const isLeaf = !allRules.some((r) => r.parentRule?.ruleId === rule.ruleId);
  // Note: Info tooltip only says "Completed by {User}" if completed in general view
  const completedByName = rule.completedBy && `${rule.completedBy.firstName} ${rule.completedBy.lastName}`;
  const completionMessage = completedByName
    ? `Completed by ${completedByName}${rule.completedInProject ? ` in ${rule.completedInProject.projectName}` : ''}`
    : '';

  // only leafs are interactive
  const isInteractive = isLeaf && Boolean(onClick);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {isLeaf && isComplete && completionMessage && (
        <Tooltip title={completionMessage} arrow>
          <IconButton size="small" onClick={(e) => e.stopPropagation()} sx={{ padding: '2px', color: 'text.secondary' }}>
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Box
        onClick={
          isInteractive
            ? (e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                onClick!(e);
              }
            : undefined
        }
        sx={{
          backgroundColor: color,
          color: 'white',
          fontSize: '11px',
          fontWeight: 600,
          pl: isInteractive ? 0.25 : 0.75,
          pr: 0.75,
          py: 0.25,
          borderRadius: '3px',
          cursor: isInteractive ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          '&:hover': isInteractive ? { opacity: 0.85 } : {}
        }}
      >
        {isInteractive &&
          (popoverOpen ? (
            <KeyboardArrowDown sx={{ fontSize: '16px', mr: 0.25 }} />
          ) : (
            <KeyboardArrowRight sx={{ fontSize: '16px', mr: 0.25 }} />
          ))}
        {label}
      </Box>
    </Box>
  );
};

export default RuleStatusTag;
