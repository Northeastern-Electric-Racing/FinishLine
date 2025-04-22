import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {
  useGetAllReimbursementRequestData,
  useGetAllSpendingBarData,
  useGetReimbursementRequestTeamData,
  useGetReimbursementRequestTeamTypeData,
  useGetSpendingBarTeamData,
  useGetSpendingBarTeamTypeData
} from '../../../hooks/finance.hooks';
import { Grid } from '@mui/material';
import TitleBox from '../FinanceComponents/TitleBox';
import PieChart from '../FinanceComponents/PieChart';
import { useState } from 'react';

interface FinanceDashboardCategoryViewProps {
  startDate?: Date;
  endDate?: Date;
}

const FinanceDashboardTeamView: React.FC<FinanceDashboardCategoryViewProps> = ({ startDate, endDate }) => {
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

  const [selectedTab, setSelectedTab] = useState('total');

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TitleBox
          title="Balance"
          tabs={[
            { label: 'Total', value: 'total' },
            { label: 'Budget', value: 'budget' },
            { label: 'Cash', value: 'cash' }
          ]}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        >
          {selectedTab === 'total' && <PieChart
            totalBalance={rrData.totalBudget}
            pendingFinance={rrData[0].pendingFinance}
            pendingLeadership={rrData[0].pendingLeadership}
            submittedToSABO={rrData[0].submittedToSabo}
            reimbursed={rrData[0].reimbursed}
            available={rrData[0].available}
          />}
          {selectedTab === 'budget' && <PieChart data={rrData[1]} />}
          {selectedTab === 'cash' && <PieChart data={rrData[2]} />}
        </TitleBox>
      </Grid>

      <Grid item xs={12} md={8}>
        <TitleBox title="Spending">{/* You can render the spending data here, e.g., in bars or custom cards */}</TitleBox>
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardTeamView;
