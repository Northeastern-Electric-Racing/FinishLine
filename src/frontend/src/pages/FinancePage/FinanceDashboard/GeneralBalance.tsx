import { Box, Typography } from '@mui/material';
import { ReimbursementRequestData } from 'shared';
import { grey } from '@mui/material/colors';
import PieChart from '../FinanceComponents/PieChart';

const GeneralBalance = ({ data }: { data: ReimbursementRequestData }) => {
  return (
    <Box
      sx={{
        background: grey[900],
        borderRadius: 2,
        boxShadow: 2,
        p: { xs: 1, sm: 2 },
        minHeight: { xs: 'auto', sm: '475px' },
        width: '100%'
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Balance
      </Typography>
      <PieChart
        totalBalance={data.totalBudget}
        pendingLeadership={data.pendingLeadership}
        pendingFinance={data.pendingFinance}
        submittedToSABO={data.submittedToSabo}
        reimbursed={data.reimbursed}
        available={data.available}
      />
    </Box>
  );
};

export default GeneralBalance;
