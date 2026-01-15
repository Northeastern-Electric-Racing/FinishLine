/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { Rule } from 'shared';
import WarningIcon from '@mui/icons-material/Warning';
import NERModal from '../../../components/NERModal';

interface DeleteRuleModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: () => void;
  rule: Rule;
  totalRulesToDelete: number;
}

const DeleteRuleModal = ({ open, onHide, onConfirm, rule, totalRulesToDelete }: DeleteRuleModalProps) => {
  const hasChildren = rule.subRuleIds.length > 0;
  const titlePrefix = hasChildren ? 'Delete Rule Section:' : 'Delete Rule:';

  const modalTitle = rule.ruleContent
    ? `${titlePrefix} ${rule.ruleCode} - ${rule.ruleContent}`
    : `${titlePrefix} ${rule.ruleCode}`;

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title="Confirm Deletion"
      cancelText="Cancel"
      submitText="Delete"
      onSubmit={onConfirm}
      formId="delete-rule-form"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ fontWeight: 400, fontSize: '1.25rem' }}>{modalTitle}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: '#ef4345', fontSize: 30 }} />
          <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {totalRulesToDelete} {totalRulesToDelete === 1 ? 'rule' : 'rules'} will be deleted
          </Typography>
        </Box>
      </Box>
    </NERModal>
  );
};

export default DeleteRuleModal;

