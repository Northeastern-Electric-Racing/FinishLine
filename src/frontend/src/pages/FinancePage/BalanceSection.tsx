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
  return (
    <Box
      sx={{
        bgcolor: '#2c2c2c',
        width: '100%',
        borderRadius: '8px 8px 8px 8px',
        boxShadow: 1
      }}
    >
      <h1 style={{ marginLeft: '25px', paddingTop: '18px', fontSize: '26px' }}>Balance</h1>
      <FinancePieChart
        totalBalance={totalBalance}
        pendingLeadership={pendingLeadership}
        pendingFinance={pendingFinance}
        submittedToSABO={submittedToSABO}
        reimbursed={reimbursed}
        available={available}
      />
    </Box>
  );
};

export default BalanceSection;
