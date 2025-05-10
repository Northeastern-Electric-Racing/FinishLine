import { Box, Tab, Tabs, Typography } from '@mui/material';
import { ReimbursementRequestData, SpendingBarData } from 'shared';
import { grey } from '@mui/material/colors';
import PieChart from '../FinanceComponents/PieChart';
import { useState } from 'react';
import ExtendedPieChart from '../FinanceComponents/ExtendedPieChart';

const AdminBalance = ({ data }: { data: ReimbursementRequestData[] }) => {
  const [selectedTab, setSelectedTab] = useState('total');
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
        Balance
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(_event, newValue) => setSelectedTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            borderBottom: '2px solid gray'
          }
        }}
      >
        <Tab label="Total" value="total" />
        <Tab label="Budget" value="budget" />
        <Tab label="Cash" value="cash" />
      </Tabs>
      {selectedTab === 'total' && (
        <PieChart
          totalBalance={data[0].totalBudget}
          pendingFinance={data[0].pendingFinance}
          pendingLeadership={data[0].pendingLeadership}
          submittedToSABO={data[0].submittedToSabo}
          reimbursed={data[0].reimbursed}
          available={data[0].available}
        />
      )}
      {selectedTab === 'budget' && (
        <Box display="flex" flexDirection="column" gap={4}>
          <PieChart
            totalBalance={data[1].totalBudget}
            pendingFinance={data[1].pendingFinance}
            pendingLeadership={data[1].pendingLeadership}
            submittedToSABO={data[1].submittedToSabo}
            reimbursed={data[1].reimbursed}
            available={data[1].available}
          />
          <ExtendedPieChart />
        </Box>
      )}
      {selectedTab === 'cash' && (
        <PieChart
          totalBalance={data[2].totalBudget}
          pendingFinance={data[2].pendingFinance}
          pendingLeadership={data[2].pendingLeadership}
          submittedToSABO={data[2].submittedToSabo}
          reimbursed={data[2].reimbursed}
          available={data[2].available}
        />
      )}
    </Box>
  );
};

export default AdminBalance;
