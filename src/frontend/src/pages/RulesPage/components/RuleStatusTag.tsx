/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, IconButton, Tooltip } from '@mui/material';
import { InfoOutlined, KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import { Rule, formatTimestamp } from 'shared';
import { getRuleStatusConfig, getRuleStatus } from '../../../utils/rules.utils';

interface RuleStatusTagProps {
  rule: Rule;
  allRules?: Rule[];
  // ability to update completion status
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  // controls chevron direction when completion is interactive
  popoverOpen?: boolean;
  // if provided, the info icon opens a full status-history modal instead of a one-line tooltip
  onInfoClick?: (rule: Rule) => void;
}

/**
 * Status chip for a rule.
 * A leaf shows its own status, while a parent's status rolls up from its descendant leaf
 * rules (Fail > Pending > Pass). Leafs with a Pass/Fail status also show an info icon -
 * a one-line "who marked it and when" tooltip by default, or (if onInfoClick is given) a
 * button that opens the full status-history modal instead.
 */
const RuleStatusTag: React.FC<RuleStatusTagProps> = ({ rule, allRules, onClick, popoverOpen = false, onInfoClick }) => {
  const status = getRuleStatus(rule, allRules);
  const { label, color } = getRuleStatusConfig(status);

  const isLeaf = allRules ? !allRules.some((r) => r.parentRule?.ruleId === rule.ruleId) : rule.subRuleIds.length === 0;
  const statusUpdatedByName = rule.statusUpdatedBy && `${rule.statusUpdatedBy.firstName} ${rule.statusUpdatedBy.lastName}`;
  const statusMessage =
    statusUpdatedByName && rule.statusUpdatedAt
      ? `Marked ${label.toUpperCase()} by ${statusUpdatedByName} on ${formatTimestamp(rule.statusUpdatedAt)}`
      : '';

  // hasStatusHistory persists even after the current status is reverted to PENDING
  const showInfo = isLeaf && (onInfoClick ? rule.hasStatusHistory : Boolean(statusMessage));

  // only leafs are interactive
  const isInteractive = isLeaf && Boolean(onClick);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {showInfo && (
        <Tooltip title={onInfoClick ? 'View Status History' : statusMessage} arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick?.(rule);
            }}
            sx={{ padding: '2px', color: 'text.secondary' }}
          >
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
