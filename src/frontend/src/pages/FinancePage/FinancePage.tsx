/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, ListItemIcon, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PageBlock from '../../layouts/PageBlock';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Refunds from './RefundsSection';
import ReimbursementRequestTable from './ReimbursementRequestsSection';
import { useAllReimbursementRequests, useCurrentUserReimbursementRequests } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';

const FinancePage = () => {
  const user = useCurrentUser();

  const { data, isLoading, isError, error } = useCurrentUserReimbursementRequests();
  const {
    data: allRequestData,
    isLoading: allIsLoading,
    isError: allIsError,
    error: allError
  } = useAllReimbursementRequests();

  const isFinance = user.isFinance;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (user.isFinance && allIsError) return <ErrorPage message={allError?.message} />;
  if (isError) return <ErrorPage message={error?.message} />;
  if ((user.isFinance && (allIsLoading || !allRequestData)) || isLoading || !data) return <LoadingIndicator />;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const financeActionsDropdown = (
    <>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="project-actions-dropdown"
        onClick={handleClick}
      >
        Actions
      </NERButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          Create Reimbursement Request
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <AttachMoneyIcon fontSize="small" />
          </ListItemIcon>
          Report Refund
        </MenuItem>
        <MenuItem onClick={() => {}} disabled={!isFinance}>
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          Pending Advisor List
        </MenuItem>
        <MenuItem onClick={() => {}} disabled={!isFinance}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          Generate All Receipts
        </MenuItem>
      </Menu>
    </>
  );
  return (
    <div>
      <PageTitle title={'Reimbursement Requests'} previousPages={[]} actionButton={financeActionsDropdown} />
      <Box sx={{ display: 'flex', flexDirection: 'horizontal' }}>
        <Box style={{ flex: 2, marginRight: '10px' }}>
          <Refunds currentUserRequests={data} allRequests={allRequestData} />
        </Box>
        <Box style={{ flex: 3 }}>
          <ReimbursementRequestTable currentUserRequests={data} allRequests={allRequestData} />
        </Box>
      </Box>
    </div>
  );
};

export default FinancePage;
