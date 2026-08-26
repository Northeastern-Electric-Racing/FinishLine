/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, IconButton, Tooltip } from '@mui/material';
import { InfoOutlined, KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import { Rule, formatTimestamp } from 'shared';
import { getRuleStatusConfig } from '../../../utils/rules.utils';

interface RuleStatusTagProps {
  rule: Rule;
  // whether this rule is a leaf in the tree being displayed
  isLeaf: boolean;
  // ability to update completion status
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  // controls chevron direction when completion is interactive
  popoverOpen?: boolean;
  // if provided, the info icon opens a full status-history modal instead of a one-line tooltip
  onInfoClick?: (rule: Rule) => void;
}

/** Status chip for a rule. Leafs with a Pass/Fail status also show an info icon/tooltip. */
const RuleStatusTag: React.FC<RuleStatusTagProps> = ({ rule, isLeaf, onClick, popoverOpen = false, onInfoClick }) => {
  const { label, color } = getRuleStatusConfig(rule.status);

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
