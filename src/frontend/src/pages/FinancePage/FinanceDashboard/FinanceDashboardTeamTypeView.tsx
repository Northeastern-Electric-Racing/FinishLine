import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetReimbursementRequestTeamTypeData, useGetSpendingBarTeamTypeData } from '../../../hooks/finance.hooks';
import { Box, Grid, Typography } from '@mui/material';
import PieChart from '../FinanceComponents/PieChart';

interface FinanceDashboardTeamTypeViewProps {
  teamTypeId: string;
  startDate?: Date;
  endDate?: Date;
}

const FinanceDashboardTeamView: React.FC<FinanceDashboardTeamTypeViewProps> = ({ teamTypeId, startDate, endDate }) => {
  const {
    data: rrData,
    isLoading: rrDataIsLoading,
    isError: rrDataIsError,
    error: rrDataError
  } = useGetReimbursementRequestTeamTypeData({ teamTypeId, startDate, endDate });
  const {
    data: spendingBarData,
    isLoading: spendingBarDataIsLoading,
    isError: spendingBarDataIsError,
    error: spendingBarDataError
  } = useGetSpendingBarTeamTypeData({ teamTypeId, startDate, endDate });

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
          <PieChart
            totalBalance={rrData.totalBudget}
            pendingFinance={rrData.pendingFinance}
            pendingLeadership={rrData.pendingLeadership}
            submittedToSABO={rrData.submittedToSabo}
            reimbursed={rrData.reimbursed}
            available={rrData.available}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        {/* <TitleBox title="Spending">{/* You can render the spending data here, e.g., in bars or custom cards </TitleBox> */}
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardTeamView;
