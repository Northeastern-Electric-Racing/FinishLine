import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { ReimbursementRequest, isAdmin } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import ReimbursementRequestInfo from './FinanceComponents/ReimbursementRequestInfo';
import Tabs from '../../components/Tabs';

interface ReimbursementRequestTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
}

const ReimbursementRequestTable = ({
  userReimbursementRequests,
  allReimbursementRequests
}: ReimbursementRequestTableProps) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();
  const canViewAllReimbursementRequests = user.isFinance || isAdmin(user.role);

  const tabs = [
    {
      label: 'My Requests',
      component: (
        <ReimbursementRequestInfo
          userReimbursementRequests={userReimbursementRequests}
          allReimbursementRequests={allReimbursementRequests}
        />
      )
    }
  ];
  if (canViewAllReimbursementRequests)
    tabs.push({
      label: 'All Club Requests',
      component: (
        <ReimbursementRequestInfo
          userReimbursementRequests={userReimbursementRequests}
          allReimbursementRequests={allReimbursementRequests}
          canViewAllReimbursementRequests
        />
      )
    });

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      <Tabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} greyscale />
    </Box>
  );
};

export default ReimbursementRequestTable;
