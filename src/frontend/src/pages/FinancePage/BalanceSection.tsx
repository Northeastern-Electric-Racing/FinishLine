import React from 'react';
import { Box, useTheme } from '@mui/material';
import FinancePieChart from '../../components/FinancePieChart';

interface BalanceSectionProps {
  totalBalance: number;
  pendingLeadership: number;
  pendingFinance: number;
  submittedToSABO: number;
  reimbursed: number;
  available: number;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({
  totalBalance,
  pendingLeadership,
  pendingFinance,
  submittedToSABO,
  reimbursed,
  available
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, width: '100%', borderRadius: '8px 8px 8px 8px', boxShadow: 1 }}>
      <FinancePieChart
        totalBalance={totalBalance}
        pendingLeadership={pendingLeadership}
        pendingFinance={pendingFinance}
        submittedToSABO={submittedToSABO}
        reimbursed={reimbursed}
        available={available}
      />
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          width: '100%',
          padding: '30px',
          borderRadius: '0 0 8px 8px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      ></Box>
    </Box>
  );
};

export default BalanceSection;
