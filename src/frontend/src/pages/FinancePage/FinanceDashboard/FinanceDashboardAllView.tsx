import React, { useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllReimbursementRequestData, useGetAllSpendingBarData } from '../../../hooks/finance.hooks';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import PieChart from '../FinanceComponents/PieChart';

interface FinanceDashboardAllViewProps {
  startDate?: Date;
  endDate?: Date;
}

const FinanceDashboardAllView: React.FC<FinanceDashboardAllViewProps> = ({ startDate, endDate }) => {
  const payload = { startDate, endDate };
  // this hook returns the all data then budget data then cash data
  const {
    data: allRRData,
    isLoading: allRRDataIsLoading,
    isError: allRRDataIsError,
    error: allRRDataError
  } = useGetAllReimbursementRequestData(payload);

  const {
    data: spendingData,
    isLoading: spendingDataIsLoading,
    isError: spendingDataIsError,
    error: spendingDataError
  } = useGetAllSpendingBarData(payload);

  const [selectedTab, setSelectedTab] = useState('total');

  if (allRRDataIsError) {
    return <ErrorPage error={allRRDataError} />;
  }

  if (!allRRData || allRRDataIsLoading) {
    return <LoadingIndicator />;
  }

  if (spendingDataIsError) {
    return <ErrorPage error={spendingDataError} />;
  }

  if (!spendingData || spendingDataIsLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Box
          sx={{
            background: '#424242',
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
          >
            <Tab label="Total" value="total" />
            <Tab label="Budget" value="budget" />
            <Tab label="Cash" value="cash" />
          </Tabs>
          {selectedTab === 'total' && (
            <PieChart
              totalBalance={allRRData[0].totalBudget}
              pendingFinance={allRRData[0].pendingFinance}
              pendingLeadership={allRRData[0].pendingLeadership}
              submittedToSABO={allRRData[0].submittedToSabo}
              reimbursed={allRRData[0].reimbursed}
              available={allRRData[0].available}
            />
          )}
          {selectedTab === 'budget' && (
            <PieChart
              totalBalance={allRRData[1].totalBudget}
              pendingFinance={allRRData[1].pendingFinance}
              pendingLeadership={allRRData[1].pendingLeadership}
              submittedToSABO={allRRData[1].submittedToSabo}
              reimbursed={allRRData[1].reimbursed}
              available={allRRData[1].available}
            />
          )}
          {selectedTab === 'cash' && (
            <PieChart
              totalBalance={allRRData[2].totalBudget}
              pendingFinance={allRRData[2].pendingFinance}
              pendingLeadership={allRRData[2].pendingLeadership}
              submittedToSABO={allRRData[2].submittedToSabo}
              reimbursed={allRRData[2].reimbursed}
              available={allRRData[2].available}
            />
          )}
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
        {/* <TitleBox title="Spending">{/* You can render the spending data here, e.g., in bars or custom cards </TitleBox> */}
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardAllView;
