import React from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllReimbursementRequestData, useGetAllSpendingBarData } from '../../../hooks/finance.hooks';
import { Grid } from '@mui/material';
import SpendingAndAllocation from './SpendingAndAllocation';
import AdminBalance from './AdminBalance';

interface FinanceDashboardAllViewProps {
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

const FinanceDashboardAllView: React.FC<FinanceDashboardAllViewProps> = ({ startDate, endDate, carNumber }) => {
  const payload = { startDate, endDate, carNumber };
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

  if (allRRDataIsError) {
    return <ErrorPage error={allRRDataError} />;
  }

  if (spendingDataIsError) {
    return <ErrorPage error={spendingDataError} />;
  }

  if (!allRRData || allRRDataIsLoading || !spendingData || spendingDataIsLoading) {
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
        <AdminBalance data={allRRData} />
      </Grid>
      <Grid item xs={12} sm={6} md={7.5}>
        <SpendingAndAllocation data={spendingData} />
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardAllView;
