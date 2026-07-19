/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import NERModal from '../../../components/NERModal';

interface MismatchedRuleCodeModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: () => void;
  messages: string[];
  originalCode?: string;
  updatedCode?: string;
}

/**
 * Warns that a rule code doesn't follow the parent-code-prefix convention, without blocking
 * the action. Rule codes aren't required to share their parent's prefix, but it does make the display a bit more confusing.
 */
const MismatchedRuleCodeModal = ({
  open,
  onHide,
  onConfirm,
  messages,
  originalCode,
  updatedCode
}: MismatchedRuleCodeModalProps) => {
  const confirmationQuestion =
    originalCode !== undefined && updatedCode !== undefined
      ? `Update rule code from ${originalCode} to ${updatedCode}?`
      : undefined;

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title="Rule Code Update"
      cancelText="Cancel"
      submitText="Submit"
      onSubmit={onConfirm}
      formId="mismatched-rule-code-form"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((message, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#ef4345', fontSize: 24, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '1rem' }}>{message}</Typography>
          </Box>
        ))}
        {confirmationQuestion && <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>{confirmationQuestion}</Typography>}
      </Box>
    </NERModal>
  );
};

export default MismatchedRuleCodeModal;
