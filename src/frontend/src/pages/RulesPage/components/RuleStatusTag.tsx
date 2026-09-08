/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Checkbox, IconButton, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { Rule, RuleStatus, formatTimestamp } from 'shared';
import { getRuleStatusConfig } from '../../../utils/rules.utils';

interface RuleStatusTagProps {
  rule: Rule;
  // whether this rule is a leaf in the tree being displayed
  isLeaf: boolean;
  // called with the new status when a Pass/Fail checkbox is toggled
  onStatusChange?: (status: RuleStatus) => void;
  // blocks the checkboxes while a status update is loading
  disabled?: boolean;
  // if provided, the info icon opens a full status-history modal instead of a one-line tooltip
  onInfoClick?: (rule: Rule) => void;
}

/**
 * Status chip for a rule. Leaf rules show Pass/Fail checkboxes instead of the chip, plus an info icon/tooltip.
 * Parent rules show their aggregated status as a read-only chip.
 */
const RuleStatusTag: React.FC<RuleStatusTagProps> = ({ rule, isLeaf, onStatusChange, disabled = false, onInfoClick }) => {
  const { label, color } = getRuleStatusConfig(rule.status);
  const passColor = getRuleStatusConfig(RuleStatus.PASS).color;
  const failColor = getRuleStatusConfig(RuleStatus.FAIL).color;

  const statusUpdatedByName = rule.statusUpdatedBy && `${rule.statusUpdatedBy.firstName} ${rule.statusUpdatedBy.lastName}`;
  const statusMessage =
    statusUpdatedByName && rule.statusUpdatedAt
      ? `Marked ${label.toUpperCase()} by ${statusUpdatedByName} on ${formatTimestamp(rule.statusUpdatedAt)}`
      : '';

  // hasStatusHistory persists even after the current status is reverted to PENDING
  const showInfo = isLeaf && (onInfoClick ? rule.hasStatusHistory : Boolean(statusMessage));

  const showCheckboxes = isLeaf && Boolean(onStatusChange);

  const checkboxSx = (checkedColor: string) => ({
    color: checkedColor,
    '&.Mui-checked': { color: checkedColor },
    p: 0.1
  });

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Box sx={{ width: '52px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {showCheckboxes ? (
          <>
            <Checkbox
              checked={rule.status === RuleStatus.PASS}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onStatusChange?.(rule.status === RuleStatus.PASS ? RuleStatus.PENDING : RuleStatus.PASS)}
              disabled={disabled}
              sx={checkboxSx(passColor)}
              slotProps={{ input: { 'aria-label': 'Pass' } }}
            />
            <Checkbox
              checked={rule.status === RuleStatus.FAIL}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onStatusChange?.(rule.status === RuleStatus.FAIL ? RuleStatus.PENDING : RuleStatus.FAIL)}
              disabled={disabled}
              sx={checkboxSx(failColor)}
              slotProps={{ input: { 'aria-label': 'Fail' } }}
            />
          </>
        ) : (
          <Box
            sx={{
              backgroundColor: color,
              color: 'white',
              fontSize: '11px',
              fontWeight: 600,
              width: '50px',
              py: 0.25,
              borderRadius: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </Box>
        )}
      </Box>
      <Box sx={{ width: '24px', ml: 0.75, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
      </Box>
    </Box>
  );
};

export default RuleStatusTag;
