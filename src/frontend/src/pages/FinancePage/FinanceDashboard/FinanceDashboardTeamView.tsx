import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetReimbursementRequestTeamData, useGetSpendingBarTeamData } from '../../../hooks/finance.hooks';
import { Box, Grid, Typography } from '@mui/material';
import PieChart from '../FinanceComponents/PieChart';
import SpendingAndAllocation from './SpendingAndAllocation';
import GeneralBalance from './GeneralBalance';

interface FinanceDashboardTeamViewProps {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
}

const FinanceDashboardTeamView: React.FC<FinanceDashboardTeamViewProps> = ({ teamId, startDate, endDate }) => {
  const {
    data: rrData,
    isLoading: rrDataIsLoading,
    isError: rrDataIsError,
    error: rrDataError
  } = useGetReimbursementRequestTeamData({ teamId, startDate, endDate });

  const {
    data: spendingBarData,
    isLoading: spendingBarDataIsLoading,
    isError: spendingBarDataIsError,
    error: spendingBarDataError
  } = useGetSpendingBarTeamData({ teamId, startDate, endDate });

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
        <GeneralBalance data={rrData} />
      </Grid>
      <Grid item xs={12} md={8}>
        <SpendingAndAllocation data={[spendingBarData]} />
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardTeamView;
