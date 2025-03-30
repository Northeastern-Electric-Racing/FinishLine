/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import React, { useState } from 'react';
import { Box, Grid, ListItemIcon, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Refunds from './RefundsSection';
import ReimbursementRequestTable from './ReimbursementRequestsSection';
import {
  useAllReimbursementRequests,
  useCurrentUserReimbursementRequests,
  useDownloadCSVFileOfReimbursementRequests,
  useGetPendingAdvisorList
} from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageLayout from '../../components/PageLayout';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import GenerateReceiptsModal from './FinanceComponents/GenerateReceiptsModal';
import PendingAdvisorModal from './FinanceComponents/PendingAdvisorListModal';
import { isAdmin, isGuest, Project, ReimbursementRequest, ReimbursementStatusType } from 'shared';
import WorkIcon from '@mui/icons-material/Work';
import TotalAmountSpentModal from './FinanceComponents/TotalAmountSpentModal';
import { useToast } from '../../hooks/toasts.hooks';
import ReportRefundModal from './FinanceComponents/ReportRefundModal';
import { useAllProjects } from '../../hooks/projects.hooks';
import BalanceSection from './BalanceSection';

const FinancePage = () => {
  const user = useCurrentUser();
  const history = useHistory();
  const [showGenerateReceipts, setShowGenerateReceipts] = useState(false);

  const {
      data: allProjects,
      isLoading: allProjectsIsLoading,
      isError: allProjectsIsError,
      error: allProjectsError
    } = useAllProjects();
    
  const {
    data: userReimbursementRequests,
    isLoading: userReimbursementRequestIsLoading,
    isError: userReimbursementRequestIsError,
    error: userReimbursementRequestError
  } = useCurrentUserReimbursementRequests();
  const {
    data: allReimbursementRequests,
    isLoading: allReimbursementRequestsIsLoading,
    isError: allReimbursementRequestsIsError,
    error: allReimbursementRequestsError
  } = useAllReimbursementRequests();
  const {
    data: allPendingAdvisorList,
    isLoading: allPendingAdvisorListIsLoading,
    isError: allPendingAdvisorListIsError,
    error: allPendingAdvisorListError
  } = useGetPendingAdvisorList();
  const { mutateAsync: downloadCSVFileOfReimbursementRequests } = useDownloadCSVFileOfReimbursementRequests();
  const toast = useToast();

  const { isFinance } = user;
  const canViewAllReimbursementRequestsAndTotalBudget = user.isFinance || isAdmin(user.role);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [showPendingAdvisorListModal, setShowPendingAdvisorListModal] = useState(false);
  const [accountCreditModalShow, setAccountCreditModalShow] = useState<boolean>(false);
  const [showTotalAmountSpent, setShowTotalAmountSpent] = useState(false);

  if (isFinance && allReimbursementRequestsIsError) return <ErrorPage message={allReimbursementRequestsError?.message} />;
  if (userReimbursementRequestIsError) return <ErrorPage message={userReimbursementRequestError?.message} />;
  if (isFinance && allPendingAdvisorListIsError) return <ErrorPage message={allPendingAdvisorListError?.message} />;
  if (
    (isFinance && (allReimbursementRequestsIsLoading || !allReimbursementRequests)) ||
    userReimbursementRequestIsLoading ||
    !userReimbursementRequests ||
    (isFinance && !allPendingAdvisorList)
  )
    return <LoadingIndicator />;

  if (isFinance && (!allPendingAdvisorList || allPendingAdvisorListIsLoading)) return <LoadingIndicator />;

  if (canViewAllReimbursementRequestsAndTotalBudget && allProjectsIsError)
    return <ErrorPage message={allProjectsError?.message} />;
  if (user.isFinance && allProjectsIsError) return <ErrorPage message={allProjectsError?.message} />;
  if (allProjectsIsError) return <ErrorPage message={allProjectsError?.message} />;
  if (
    (canViewAllReimbursementRequestsAndTotalBudget && (allProjectsIsLoading || !allProjects)) ||
    (user.isFinance && (allProjectsIsLoading || !allProjects)) ||
    !allProjects
  )
    return <LoadingIndicator />;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const downloadReimbursementRequests = async () => {
    try {
      await downloadCSVFileOfReimbursementRequests();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const displayedReimbursementRequests = (
      (canViewAllReimbursementRequestsAndTotalBudget ? (allReimbursementRequests ? allReimbursementRequests : userReimbursementRequests) : userReimbursementRequests)
    ).filter(
      (request: ReimbursementRequest) =>
        !request.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)
    );
  
    const totalBudget = allProjects.reduce(
      (accumulator: number, currentVal: Project) => accumulator + currentVal.budget,
      0
    );
  
    const totalBalance = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => accumulator + currentVal.totalCost,
      0
    );
  
    const pendingLeadership = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'PENDING_LEADERSHIP_APPROVAL'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const pendingFinance = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'PENDING_FINANCE'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const submittedToSABO = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'SABO_SUBMITTED'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const reimbursed = displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => {
        if (
          currentVal.reimbursementStatuses[currentVal.reimbursementStatuses.length - 1].type === 
          'REIMBURSED'
        ) {
          return accumulator + currentVal.totalCost;
        } 
        return accumulator; 
      }, 
      0 
    );
  
    const available = totalBudget - totalBalance;

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
        <MenuItem onClick={() => history.push(routes.NEW_REIMBURSEMENT_REQUEST)} disabled={isGuest(user.role)}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          Create Reimbursement Request
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAccountCreditModalShow(true);
            handleDropdownClose();
          }}
          disabled={isGuest(user.role)}
        >
          <ListItemIcon>
            <AttachMoneyIcon fontSize="small" />
          </ListItemIcon>
          Report Refund
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDropdownClose();
            setShowPendingAdvisorListModal(true);
          }}
          disabled={!isFinance}
        >
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          Pending Advisor List
        </MenuItem>
        <MenuItem onClick={() => setShowGenerateReceipts(true)} disabled={!isFinance}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          Generate All Receipts
        </MenuItem>
        <MenuItem onClick={() => setShowTotalAmountSpent(true)} disabled={!isFinance}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          Total Amount Spent
        </MenuItem>
        <MenuItem onClick={async () => await downloadReimbursementRequests()} disabled={!isFinance && !isAdmin(user.role)}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          Download Reimbursement Requests To CSV
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <PageLayout title="Finance" headerRight={financeActionsDropdown}>
      {isFinance && (
        <PendingAdvisorModal
          open={showPendingAdvisorListModal}
          saboNumbers={allPendingAdvisorList!.map((reimbursementRequest) => reimbursementRequest.saboId!)}
          onHide={() => setShowPendingAdvisorListModal(false)}
        />
      )}
      {isFinance && (
        <TotalAmountSpentModal
          open={showTotalAmountSpent}
          allReimbursementRequests={allReimbursementRequests!}
          onHide={() => setShowTotalAmountSpent(false)}
        />
      )}
      <ReportRefundModal showModal={accountCreditModalShow} handleClose={() => setAccountCreditModalShow(false)} />
      <GenerateReceiptsModal
        open={showGenerateReceipts}
        setOpen={setShowGenerateReceipts}
        allReimbursementRequests={allReimbursementRequests}
      />
      <Grid container>
        <Grid item xs={12} sm={12} md={4}>
          <Refunds
            userReimbursementRequests={userReimbursementRequests}
            allReimbursementRequests={allReimbursementRequests}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box sx={{ marginTop: { xs: '10px', sm: '10px', md: '0' }, marginLeft: { xs: '0', sm: '0', md: '10px' } }}>
            <ReimbursementRequestTable
              userReimbursementRequests={userReimbursementRequests}
              allReimbursementRequests={allReimbursementRequests}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={4} sx={{ marginTop: '10px' }}>
          {/* TODO: Make this take in actual data */}
          <BalanceSection
            totalBalance={totalBudget}
            pendingLeadership={pendingLeadership}
            pendingFinance={pendingFinance}
            submittedToSABO={submittedToSABO}
            reimbursed={reimbursed}
            available={available}
          />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default FinancePage;
