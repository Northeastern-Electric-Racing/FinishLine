import { Box, Typography } from '@mui/material';
import { SpendingBarData } from 'shared';
import SpendingBar from '../FinanceComponents/SpendingBar';
import { grey } from '@mui/material/colors';

const SpendingAndAllocation = ({ data }: { data: SpendingBarData[] }) => {
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
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Spending & Allocation
      </Typography>
      {data
        .sort((a, b) => b.data.length - a.data.length)
        .map((spendingData, index) => (
          <SpendingBar key={index} data={spendingData.data} title={spendingData.title} />
        ))}
    </Box>
  );
};

export default SpendingAndAllocation;
