/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { Rule, RuleStatus, formatTimestamp } from 'shared';
import NERModal from '../../../components/NERModal';
import { getRuleStatusConfig } from '../../../utils/rules.utils';

interface RuleStatusHistoryModalProps {
  open: boolean;
  onClose: () => void;
  rule: Rule;
}

interface StatusHistoryEntry {
  status: RuleStatus;
  updatedByName: string;
  updatedAt: Date;
  projectName?: string;
}

/**
 * Full status history for a rule: its general-view status, plus its status in every project
 * it's assigned to (each tracked independently), with most recent update at the top.
 */
const RuleStatusHistoryModal: React.FC<RuleStatusHistoryModalProps> = ({ open, onClose, rule }) => {
  const entries: StatusHistoryEntry[] = [];

  if (rule.statusUpdatedBy && rule.statusUpdatedAt) {
    entries.push({
      status: rule.status,
      updatedByName: `${rule.statusUpdatedBy.firstName} ${rule.statusUpdatedBy.lastName}`,
      updatedAt: rule.statusUpdatedAt
    });
  }

  rule.projects?.forEach((project) => {
    if (project.statusUpdatedBy && project.statusUpdatedAt) {
      entries.push({
        status: project.status,
        updatedByName: `${project.statusUpdatedBy.firstName} ${project.statusUpdatedBy.lastName}`,
        updatedAt: project.statusUpdatedAt,
        projectName: project.projectName
      });
    }
  });

  entries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return (
    <NERModal open={open} onHide={onClose} title={`Status History ${rule.ruleCode}`} showCloseButton hideFormButtons>
      {entries.length === 0 ? (
        <Typography color="text.secondary">No status history yet.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {entries.map((entry, index) => {
            const { color } = getRuleStatusConfig(entry.status);
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, mt: '7px', flexShrink: 0 }} />
                <Typography>
                  Marked <b>{entry.status.toUpperCase()}</b> by {entry.updatedByName} on {formatTimestamp(entry.updatedAt)}
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
