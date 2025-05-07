import { Box, Typography } from '@mui/material';
import { SpendingBarData } from 'shared';
import SpendingBar from '../FinanceComponents/SpedingBar';
import { grey } from '@mui/material/colors';

const SpendingAndAllocation = ({ data }: { data: SpendingBarData[] }) => {
  return (
    <Box
      sx={{
        background: grey[900],
        borderRadius: 2,
        boxShadow: 2,
        p: 2,
        minHeight: '650px',
        minWidth: '500px'
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Spending & Allocation
      </Typography>
      {data
        .sort((a, b) => b.data.length - a.data.length)
        .map((spendingData) => (
          <SpendingBar data={spendingData.data} title={spendingData.title} />
        ))}
    </Box>
  );
};

export default SpendingAndAllocation;
