/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, CircularProgress, Typography } from '@mui/material';
import { Rule, formatTimestamp } from 'shared';
import NERModal from '../../../components/NERModal';
import { getRuleStatusConfig } from '../../../utils/rules.utils';
import { useRuleStatusHistory } from '../../../hooks/rules.hooks';

interface RuleStatusHistoryModalProps {
  open: boolean;
  onClose: () => void;
  rule: Rule;
  // if provided, scopes history to just this project; otherwise shows every context the rule appears in
  projectRuleId?: string;
}

/**
 * Full status history for a rule: every time status was marked PASS or FAIL, most recent first.
 * Reverting to PENDING doesn't add an entry.
 */
const RuleStatusHistoryModal: React.FC<RuleStatusHistoryModalProps> = ({ open, onClose, rule, projectRuleId }) => {
  const { data: entries, isLoading } = useRuleStatusHistory(rule.ruleId, open, projectRuleId);

  return (
    <NERModal open={open} onHide={onClose} title={`Status History ${rule.ruleCode}`} showCloseButton hideFormButtons>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : !entries || entries.length === 0 ? (
        <Typography color="text.secondary">No status history yet.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {entries.map((entry, index) => {
            const { color } = getRuleStatusConfig(entry.status);
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, mt: '7px', flexShrink: 0 }} />
                <Typography>
                  Marked <b>{entry.status.toUpperCase()}</b> by {entry.updatedBy.firstName} {entry.updatedBy.lastName} on{' '}
                  {formatTimestamp(entry.updatedAt)}
                  {entry.projectName ? ` in ${entry.projectName}` : ''}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </NERModal>
  );
};

export default RuleStatusHistoryModal;
