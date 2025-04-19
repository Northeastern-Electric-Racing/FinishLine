import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { ReimbursementRequest, isHead, isLead } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import ReimbursementRequestInfo from './FinanceComponents/ReimbursementRequestInfo';
import { ReimbursementStatusType } from 'shared/src/types/reimbursement-requests-types';
import Tabs from '../../components/Tabs';

interface ReimbursementRequestTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
  searchText?: string;
  statuses?: ReimbursementStatusType[];
  startDate?: Date | null;
  endDate?: Date | null;
}

const ReimbursementRequestTable = ({
  userReimbursementRequests,
  allReimbursementRequests,
  searchText,
  statuses,
  startDate,
  endDate
}: ReimbursementRequestTableProps) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();
  const canViewAllReimbursementRequests = user.isFinance || isHead(user.role) || isLead(user.role);

  const tabs = [
    {
      label: 'My Requests',
      component: (
        <ReimbursementRequestInfo
          userReimbursementRequests={userReimbursementRequests}
          allReimbursementRequests={allReimbursementRequests}
          canViewAllReimbursementRequests={false}
          searchText={searchText}
          statuses={statuses}
          startDate={startDate}
          endDate={endDate}
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
          canViewAllReimbursementRequests={canViewAllReimbursementRequests}
          searchText={searchText}
          statuses={statuses}
          startDate={startDate}
          endDate={endDate}
        />
      )
    });

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      <Tabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} tabVariant="standard" />
    </Box>
  );
};

export default ReimbursementRequestTable;
