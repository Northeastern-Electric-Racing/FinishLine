import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {
  useGetAllReimbursementRequestData,
  useGetAllSpendingBarData
} from '../../../hooks/finance.hooks';
import { Grid } from '@mui/material';
import TitleBox from '../FinanceComponents/TitleBox';
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
        </TitleBox>
      </Grid>
      <Grid item xs={12} md={8}>
        {/* <TitleBox title="Spending">{/* You can render the spending data here, e.g., in bars or custom cards </TitleBox> */}
        ;
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardCategoriesView;
