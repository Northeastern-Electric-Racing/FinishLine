import { Box, Typography } from '@mui/material';
import NERModal from '../../../../components/NERModal';
import NERFailButton from '../../../../components/NERFailButton';
import { Rule, ProjectRule, RuleCompletion } from 'shared';

interface RuleHistoryModalProps {
  open: boolean;
  onClose: () => void;
  rule: Rule | null;
  projectRules?: ProjectRule[];
}

/**
 * Get the status chip configuration
 */
const getStatusConfig = (status: RuleCompletion) => {
  switch (status) {
    case RuleCompletion.COMPLETED:
      return { label: 'Complete', color: '#4caf50' };
    case RuleCompletion.INCOMPLETE:
      return { label: 'Incomplete', color: '#f44336' };
    case RuleCompletion.REVIEW:
    default:
      return { label: 'Review', color: '#ff9800' };
  }
};

export const RuleHistoryModal = ({ open, onClose, rule, projectRules }: RuleHistoryModalProps) => {
  if (!rule) return null;

  const projectRule = projectRules?.find((pr) => pr.rule.ruleId === rule.ruleId);
  const statusHistory = projectRule?.statusHistory || [];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatUserName = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const getStatusLabel = (status: RuleCompletion) => {
    const config = getStatusConfig(status);
    return config.label;
  };

  return (
    <NERModal open={open} onHide={onClose} title="History" hideFormButtons={true} showCloseButton={false}>
      <Box sx={{ minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            maxHeight: '300px',
            overflowY: 'auto',
            mb: 3,
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.5)'
              }
            }
          }}
        >
          <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {statusHistory.map((history) => (
              <Box
                component="li"
                key={history.historyId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1
                }}
              >
                <Typography sx={{ fontSize: '25', color: 'text.primary' }}>
                  •{formatDate(history.dateCreated)} - {formatUserName(history.createdBy)} Marked as{' '}
                  {getStatusLabel(history.newStatus)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <NERFailButton onClick={onClose}>Exit</NERFailButton>
        </Box>
      </Box>
    </NERModal>
  );
};
