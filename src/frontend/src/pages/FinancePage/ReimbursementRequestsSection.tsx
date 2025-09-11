import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { ReimbursementRequest, isHead, isLead } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import FullPageTabs from '../../components/FullPageTabs';
import { routes } from '../../utils/routes';
import { ReimbursementStatusType } from 'shared/src/types/reimbursement-requests-types';
import ReimbursementRequestInfo from './FinanceComponents/ReimbursementRequestInfo';

interface ReimbursementRequestTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  assignedReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
  onCloseSidePage: () => void;
  searchText?: string;
  statuses?: ReimbursementStatusType[];
  startDate?: Date | null;
  endDate?: Date | null;
}

const ReimbursementRequestTable = ({
  userReimbursementRequests,
  assignedReimbursementRequests,
  allReimbursementRequests,
  onCloseSidePage,
  searchText,
  statuses,
  startDate,
  endDate
}: ReimbursementRequestTableProps) => {
  const defaultTab = '/my-requests';

  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();
  const canViewAllReimbursementRequests = user.isFinance || isHead(user.role) || isLead(user.role);

  const tabs = [{ tabUrlValue: 'my-requests', tabName: 'My Requests' }];

  if (canViewAllReimbursementRequests) tabs.push({ tabUrlValue: 'all-requests', tabName: 'All Requests' });

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      {canViewAllReimbursementRequests && (
        <Box
          sx={{
            width: 'fit-content',
            mb: 2
          }}
        >
          <FullPageTabs
            noUnderline
            setTab={setTabValue}
            tabsLabels={tabs}
            baseUrl={routes.REIMBURSEMENT_REQUESTS}
            defaultTab={defaultTab}
            id="reimbursement-request-tabs"
          />
        </Box>
      )}
      <ReimbursementRequestInfo
        userReimbursementRequests={userReimbursementRequests}
        assignedReimbursementRequests={assignedReimbursementRequests}
        allReimbursementRequests={allReimbursementRequests}
        canViewAllReimbursementRequests={canViewAllReimbursementRequests}
        currentTab={tabValue}
        searchText={searchText}
        statuses={statuses}
        startDate={startDate}
        endDate={endDate}
        onCloseSidePage={onCloseSidePage}
      />
    </Box>
  );
};

export default ReimbursementRequestTable;
