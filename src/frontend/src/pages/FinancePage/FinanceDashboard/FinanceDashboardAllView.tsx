import React, { useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllReimbursementRequestData, useGetAllSpendingBarData } from '../../../hooks/finance.hooks';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import PieChart from '../FinanceComponents/PieChart';
import SpendingAndAllocation from './SpendingAndAllocation';
import { grey } from '@mui/material/colors';
import AdminBalance from './AdminBalance';

interface FinanceDashboardAllViewProps {
  startDate?: Date;
  endDate?: Date;
}

const FinanceDashboardAllView: React.FC<FinanceDashboardAllViewProps> = ({ startDate, endDate }) => {
  const payload = { startDate, endDate };
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
    <Grid container columnSpacing={{ xs: 2, md: 25 }} rowSpacing={2} sx={{ flexWrap: 'wrap' }}>
      <Grid item xs={12} md={4}>
        <AdminBalance data={allRRData} />
      </Grid>
      <Grid item xs={12} md={8}>
        <SpendingAndAllocation data={spendingData} />
      </Grid>
    </Grid>
  );
};

export default FinanceDashboardAllView;
