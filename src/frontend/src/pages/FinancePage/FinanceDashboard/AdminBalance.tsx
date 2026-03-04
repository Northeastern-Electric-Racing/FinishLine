import { Box, Tab, Tabs, Typography } from '@mui/material';
import { ReimbursementRequestData } from 'shared';
import { grey } from '@mui/material/colors';
import PieChart from '../FinanceComponents/PieChart';
import { useState } from 'react';
import AccountAllocation from '../FinanceComponents/AccountAllocation';
import { useGetAllAccountCodes } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const AdminBalance = ({ data }: { data: ReimbursementRequestData[] }) => {
  const {
    data: accounts,
    isLoading: accountsIsLoading,
    isError: accountsIsError,
    error: accountsError
  } = useGetAllAccountCodes();

  const [selectedTab, setSelectedTab] = useState('total');

  if (accountsIsLoading || !accounts) {
    return <LoadingIndicator />;
  }

  if (accountsIsError) {
    return <ErrorPage message={accountsError?.message} />;
  }

  return (
    <Box
      sx={{
        background: grey[900],
        borderRadius: 2,
        boxShadow: 2,
        p: { xs: 1, sm: 2 },
        minHeight: { xs: 'auto', sm: '475px' },
        width: '100%'
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Balance
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(_event, newValue) => setSelectedTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            borderBottom: '2px solid gray'
          }
        }}
      >
        <Tab label="Total" value="total" />
        <Tab label="Budget" value="budget" />
        <Tab label="Cash" value="cash" />
      </Tabs>
      {selectedTab === 'total' && (
        <PieChart
          totalBalance={data[0].totalBudget}
          approved={data[0].approved}
          pendingApproval={data[0].pendingApproval}
          addedToSABO={data[0].addedToSabo}
          reimbursed={data[0].reimbursed}
          available={data[0].available}
        />
      )}
      {selectedTab === 'budget' && (
        <Box display="flex" flexDirection="column" gap={4}>
          <PieChart
            totalBalance={data[1].totalBudget}
            approved={data[1].approved}
            pendingApproval={data[1].pendingApproval}
            addedToSABO={data[1].addedToSabo}
            reimbursed={data[1].reimbursed}
            available={data[1].available}
          />
          <AccountAllocation accounts={accounts} />
        </Box>
      )}
      {selectedTab === 'cash' && (
        <PieChart
          totalBalance={data[2].totalBudget}
          approved={data[2].approved}
          pendingApproval={data[2].pendingApproval}
          addedToSABO={data[2].addedToSabo}
          reimbursed={data[2].reimbursed}
          available={data[2].available}
        />
      )}
    </Box>
  );
};

export default AdminBalance;
