import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { Reimbursement, ReimbursementRequest, isAdmin } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import EditRefundModal from './FinanceComponents/EditRefundModal';
import Tabs from '../../components/Tabs';
import RefundInfo from './FinanceComponents/RefundInfo';

interface RefundTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
}

const Refunds = ({ userReimbursementRequests, allReimbursementRequests }: RefundTableProps) => {
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();

  const [editModalRefund, setEditModalRefund] = useState<Reimbursement>();
  const theme = useTheme();
  const canViewAllReimbursementRequests = user.isFinance || isAdmin(user.role);

  const tabs = [
    {
      label: 'My Refunds',
      component: (
        <RefundInfo
          userReimbursementRequests={userReimbursementRequests}
          allReimbursementRequests={allReimbursementRequests}
          setEditModalRefund={setEditModalRefund}
        />
      )
    }
  ];
  if (canViewAllReimbursementRequests)
    tabs.push({
      label: 'All Club Refunds',
      component: (
        <RefundInfo
          userReimbursementRequests={userReimbursementRequests}
          allReimbursementRequests={allReimbursementRequests}
          setEditModalRefund={setEditModalRefund}
          canViewAllReimbursementRequests
        />
      )
    });

  return (
    <>
      <Box sx={{ bgcolor: theme.palette.background.paper, width: '100%', borderRadius: '8px 8px 8px 8px', boxShadow: 1 }}>
        <Tabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} greyscale />
      </Box>
      {editModalRefund && <EditRefundModal refund={editModalRefund} handleClose={() => setEditModalRefund(undefined)} />}
    </>
  );
};

export default Refunds;
