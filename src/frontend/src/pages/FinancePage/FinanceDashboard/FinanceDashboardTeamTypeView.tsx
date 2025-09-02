import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetReimbursementRequestTeamTypeData, useGetSpendingBarTeamTypeData } from '../../../hooks/finance.hooks';
import { Grid } from '@mui/material';
import SpendingAndAllocation from './SpendingAndAllocation';
import GeneralBalance from './GeneralBalance';

interface FinanceDashboardTeamTypeViewProps {
  teamTypeId: string;
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

const FinanceDashboardTeamView: React.FC<FinanceDashboardTeamTypeViewProps> = ({
  teamTypeId,
  startDate,
  endDate,
  carNumber
}) => {
  const {
    data: rrData,
    isLoading: rrDataIsLoading,
    isError: rrDataIsError,
    error: rrDataError
  } = useGetReimbursementRequestTeamTypeData({ teamTypeId, startDate, endDate, carNumber });
  const {
    data: spendingBarData,
    isLoading: spendingBarDataIsLoading,
    isError: spendingBarDataIsError,
    error: spendingBarDataError
  } = useGetSpendingBarTeamTypeData({ teamTypeId, startDate, endDate, carNumber });

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
    <Grid
      container
      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
      rowSpacing={{ xs: 1, sm: 2 }}
      sx={{ flexWrap: 'wrap', padding: { xs: 1, sm: 2 } }}
    >
      <Grid item xs={12} sm={6} md={4.5}>
        <GeneralBalance data={rrData} />
      </Grid>
      <Grid item xs={12} sm={6} md={7.5}>
        <SpendingAndAllocation data={spendingBarData} />
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardTeamView;
