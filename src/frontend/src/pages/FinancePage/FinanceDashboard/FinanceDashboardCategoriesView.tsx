import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllReimbursementRequestData, useGetSpendingBarCategoryData } from '../../../hooks/finance.hooks';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import PieChart from '../FinanceComponents/PieChart';
import { useState } from 'react';
import SpendingAndAllocation from './SpendingAndAllocation';
import { grey } from '@mui/material/colors';
import AdminBalance from './AdminBalance';

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
  } = useGetSpendingBarCategoryData({ startDate, endDate });

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
        <AdminBalance data={rrData} />
      </Grid>
      <Grid item xs={12} md={8}>
        <SpendingAndAllocation data={[spendingBarData]} />
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardCategoriesView;
