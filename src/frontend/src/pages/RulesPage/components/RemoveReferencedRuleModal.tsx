/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { Rule } from 'shared';
import NERModal from '../../../components/NERModal';

interface RemoveReferencedRuleModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: () => void;
  rule: Rule; // The rule the reference is being removed from
  referencedRule: Rule;
}

const RemoveReferencedRuleModal = ({ open, onHide, onConfirm, rule, referencedRule }: RemoveReferencedRuleModalProps) => {
  return (
    <NERModal
      open={open}
      onHide={onHide}
      title="Confirm Removal"
      cancelText="Cancel"
      submitText="Save"
      onSubmit={onConfirm}
      formId="remove-referenced-rule-form"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ fontWeight: 400, fontSize: '1rem' }}>
          Remove referenced rule {referencedRule.ruleCode} from {rule.ruleCode}
        </Typography>
      </Box>
    </NERModal>
  );
};

export default RemoveReferencedRuleModal;
