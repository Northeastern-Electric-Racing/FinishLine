/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
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
  useGetPendingAdvisorList,
  useCreateReimbursementRequest,
  useUploadManyReceipts
} from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import GenerateReceiptsModal from './FinanceComponents/GenerateReceiptsModal';
import PendingAdvisorModal from './FinanceComponents/PendingAdvisorListModal';
import { isAdmin, isGuest } from 'shared';
import WorkIcon from '@mui/icons-material/Work';
import TotalAmountSpentModal from './FinanceComponents/TotalAmountSpentModal';
import { useToast } from '../../hooks/toasts.hooks';
import ReportRefundModal from './FinanceComponents/ReportRefundModal';
import SidePage from './FinanceComponents/SidePagePopup';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from './ReimbursementRequestForm/ReimbursementRequestForm';

const FinancePage = () => {
  const user = useCurrentUser();
  const [showGenerateReceipts, setShowGenerateReceipts] = useState(false);

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [showPendingAdvisorListModal, setShowPendingAdvisorListModal] = useState(false);
  const [accountCreditModalShow, setAccountCreditModalShow] = useState<boolean>(false);
  const [showTotalAmountSpent, setShowTotalAmountSpent] = useState(false);

  // SidePage State
  const [showSidePage, setShowSidePage] = useState(false);
  const [sidePageTitle, setSidePageTitle] = useState('');

  const { mutateAsync: createReimbursementRequest } = useCreateReimbursementRequest();
  const { mutateAsync: uploadReceipts } = useUploadManyReceipts();

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
        <MenuItem
          onClick={() => {
            setSidePageTitle('Create Reimbursement Request');
            setShowSidePage(true);
            handleDropdownClose();
          }}
          disabled={isGuest(user.role)}
        >
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

  const openSidePage = (title: string) => {
    setSidePageTitle(title);
    setShowSidePage(true);
  };

  const closeSidePage = () => {
    setShowSidePage(false);
  };

  const onSubmit = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const reimbursementRequest = await createReimbursementRequest({ ...data, indexCodeId: data.indexCodeId! });
    await uploadReceipts({
      id: reimbursementRequest.reimbursementRequestId,
      files: data.receiptFiles.filter((receipt) => receipt.googleFileId === '').map((file) => file.file!)
    });
    closeSidePage();
    return reimbursementRequest.reimbursementRequestId;
  };

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
      </Grid>
      <NERButton
        variant="contained"
        color="primary"
        onClick={() => openSidePage('Title')} // Opens SidePage
        sx={{ marginBottom: 2 }} // Adds spacing
      >
        Open Side Page
      </NERButton>
      <SidePage
        showPage={showSidePage}
        handleClose={closeSidePage}
        title={sidePageTitle}
        component={
          sidePageTitle === 'Create Reimbursement Request' ? (
            <ReimbursementRequestForm submitText="Submit" submitData={onSubmit} previousPage={routes.FINANCE} />
          ) : (
            <Typography>This is a side page</Typography>
          )
        }
      />
    </PageLayout>
  );
};

export default FinancePage;
