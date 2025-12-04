/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Rule } from 'shared';
import WarningIcon from '@mui/icons-material/Warning';

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
    <Dialog
      open={open}
      onClose={onHide}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          width: '700px',
          maxWidth: '700px',
          backgroundColor: '#3a3a3a'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          backgroundColor: '#ef4345',
          minHeight: '90px',
          display: 'flex',
          alignItems: 'center',
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: 700,
          paddingLeft: '24px'
        }}
      >
        Confirm Deletion
      </DialogTitle>

      {/* Body */}
      <DialogContent
        sx={{
          backgroundColor: '#3a3a3a',
          '&.MuiDialogContent-root': { paddingTop: '24px' }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ color: '#ffffff', fontWeight: 400, fontSize: '1.25rem' }}>{modalTitle}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#ef4345', fontSize: 30 }} />
            <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '1.25rem' }}>
              {totalRulesToDelete} {totalRulesToDelete === 1 ? 'rule' : 'rules'} will be deleted
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ backgroundColor: '#3a3a3a', pb: 2, pr: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onHide}
            sx={{
              backgroundColor: '#ef4345',
              color: '#ffffff',
              fontSize: '1.125rem',
              paddingY: 0,
              px: 1.5,
              minHeight: 0,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#d63c37' }
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            sx={{
              backgroundColor: '#ef4345',
              color: '#ffffff',
              fontSize: '1.125rem',
              paddingY: 0,
              px: 1.5,
              minHeight: 0,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#d63c37' }
            }}
          >
            Delete
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRuleModal;
