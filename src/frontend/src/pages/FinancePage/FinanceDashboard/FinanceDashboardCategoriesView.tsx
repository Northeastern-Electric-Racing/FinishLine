import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllReimbursementRequestData, useGetAllSpendingBarData } from '../../../hooks/finance.hooks';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import PieChart from '../FinanceComponents/PieChart';
import { useState } from 'react';

interface FinanceDashboardCategoryViewProps {
  startDate?: Date;
  endDate?: Date;
}

const FinanceDashboardCategoriesView: React.FC<FinanceDashboardCategoryViewProps> = ({ startDate, endDate }) => {
  // this hook returns the all data then budget data then cash data
  const {
    data: rrData,
    isLoading: rrDataIsLoading,
    isError: rrDataIsError,
    error: rrDataError
  } = useGetAllReimbursementRequestData({ startDate, endDate });

  const {
    data: spendingBarData,
    isLoading: spendingBarDataIsLoading,
    isError: spendingBarDataIsError,
    error: spendingBarDataError
  } = useGetAllSpendingBarData({ startDate, endDate });

  const [selectedTab, setSelectedTab] = useState('total');

  if (rrDataIsError) {
    return <ErrorPage error={rrDataError} />;
  }

  if (!rrData || rrDataIsLoading) {
    return <LoadingIndicator />;
  }

  if (spendingBarDataIsError) {
    return <ErrorPage error={spendingBarDataError} />;
  }

  if (!spendingBarData || spendingBarDataIsLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Grid container columnSpacing={25} rowSpacing={2}>
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
              totalBalance={rrData[0].totalBudget}
              pendingFinance={rrData[0].pendingFinance}
              pendingLeadership={rrData[0].pendingLeadership}
              submittedToSABO={rrData[0].submittedToSabo}
              reimbursed={rrData[0].reimbursed}
              available={rrData[0].available}
            />
          )}
          {selectedTab === 'budget' && (
            <PieChart
              totalBalance={rrData[1].totalBudget}
              pendingFinance={rrData[1].pendingFinance}
              pendingLeadership={rrData[1].pendingLeadership}
              submittedToSABO={rrData[1].submittedToSabo}
              reimbursed={rrData[1].reimbursed}
              available={rrData[1].available}
            />
          )}
          {selectedTab === 'cash' && (
            <PieChart
              totalBalance={rrData[2].totalBudget}
              pendingFinance={rrData[2].pendingFinance}
              pendingLeadership={rrData[2].pendingLeadership}
              submittedToSABO={rrData[2].submittedToSabo}
              reimbursed={rrData[2].reimbursed}
              available={rrData[2].available}
            />
          )}
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
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
            Spending & Allocation
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardCategoriesView;
