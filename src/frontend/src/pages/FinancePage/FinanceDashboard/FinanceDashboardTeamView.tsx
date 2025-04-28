import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetReimbursementRequestTeamData, useGetSpendingBarTeamData } from '../../../hooks/finance.hooks';
import { Grid } from '@mui/material';
import TitleBox from '../FinanceComponents/TitleBox';
import PieChart from '../FinanceComponents/PieChart';

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
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TitleBox title="Balance">
          <PieChart
            totalBalance={rrData.totalBudget}
            pendingFinance={rrData.pendingFinance}
            pendingLeadership={rrData.pendingLeadership}
            submittedToSABO={rrData.submittedToSabo}
            reimbursed={rrData.reimbursed}
            available={rrData.available}
          />
        </TitleBox>
      </Grid>

      <Grid item xs={12} md={8}>
        {/* <TitleBox title="Spending">{/* You can render the spending data here, e.g., in bars or custom cards </TitleBox> */}
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardTeamView;
