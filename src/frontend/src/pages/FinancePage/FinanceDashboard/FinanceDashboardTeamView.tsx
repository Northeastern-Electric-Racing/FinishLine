import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetReimbursementRequestTeamData, useGetSpendingBarTeamData } from '../../../hooks/finance.hooks';
import { Grid } from '@mui/material';
import SpendingAndAllocation from './SpendingAndAllocation';
import GeneralBalance from './GeneralBalance';

interface FinanceDashboardTeamViewProps {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  overrideCarId?: string | null;
}

const FinanceDashboardTeamView: React.FC<FinanceDashboardTeamViewProps> = ({
  teamId,
  startDate,
  endDate,
  overrideCarId
}) => {
  const {
    data: rrData,
    isLoading: rrDataIsLoading,
    isError: rrDataIsError,
    error: rrDataError
  } = useGetReimbursementRequestTeamData({ teamId, startDate, endDate, overrideCarId });

  const {
    data: spendingBarData,
    isLoading: spendingBarDataIsLoading,
    isError: spendingBarDataIsError,
    error: spendingBarDataError
  } = useGetSpendingBarTeamData({ teamId, startDate, endDate, overrideCarId });

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
        <SpendingAndAllocation data={[spendingBarData]} />
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardTeamView;
