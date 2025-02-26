/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WorkIcon from '@mui/icons-material/Work';
import { Box, Grid, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isAdmin, isGuest } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { NERButton } from '../../components/NERButton';
import PageLayout from '../../components/PageLayout';
import {
  useAllReimbursementRequests,
  useCurrentUserReimbursementRequests,
  useDownloadCSVFileOfReimbursementRequests,
  useGetPendingAdvisorList
} from '../../hooks/finance.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { routes } from '../../utils/routes';
import ErrorPage from '../ErrorPage';
import GenerateReceiptsModal from './FinanceComponents/GenerateReceiptsModal';
import PendingAdvisorModal from './FinanceComponents/PendingAdvisorListModal';
import ReportRefundModal from './FinanceComponents/ReportRefundModal';
import TotalAmountSpentModal from './FinanceComponents/TotalAmountSpentModal';
import SpendingBar from './SpendingBar';
import { grey, red } from '@mui/material/colors';

const FinancePage = () => {
  const user = useCurrentUser();
  const history = useHistory();
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

  const segmentsSpendingItems = [
    { name: 'Pending Leadership', value: 3000, color: red[900] },
    { name: 'Pending Finance', value: 500, color: red[700] },
    { name: 'Submitted to SABO', value: 500, color: red[500] },
    { name: 'Reimbursed', value: 500, color: grey[700] },
    { name: 'Available', value: 1500, color: grey[500] }
  ];

  const testData = [
    [
      { name: 'Segments', value: 5000, onHoverComponent: <SpendingBar items={segmentsSpendingItems} /> },
      { name: 'Shepherd', value: 2500 },
      { name: 'Flex Therm PCBs', value: 0 }
    ],
    [
      { name: 'A', value: 1 },
      { name: 'B', value: 2 },
      { name: 'C', value: 3 }
    ],
    [
      { name: 'A', value: 1 },
      { name: 'B', value: 10 },
      { name: 'C', value: 100 }
    ],
    [
      { name: 'A', value: 1, color: 'red' },
      { name: 'B', value: 1, color: 'green' },
      { name: 'C', value: 1, color: 'blue' }
    ],
    [
      { name: '1', value: 1 },
      { name: '2', value: 2 },
      { name: '3', value: 3 },
      { name: '4', value: 4 },
      { name: '5', value: 5 },
      { name: '6', value: 6 },
      { name: '7', value: 7 },
      { name: '8', value: 8 },
      { name: '9', value: 9 },
      { name: '10', value: 10 }
    ],
    [
      { name: 'Really Long Name A', value: 1 },
      { name: 'Really Long Name B', value: 1 },
      { name: 'Really Long Name C', value: 1 },
      { name: 'Really Long Name D', value: 1 },
      { name: 'Really Long Name E', value: 1 },
      { name: 'Really Long Name F', value: 1 },
      { name: 'Really Long Name G', value: 1 },
      { name: 'Really Long Name H', value: 1 },
      { name: 'Really Long Name I', value: 1 },
      { name: 'Really Long Name J', value: 1 },
      { name: 'Really Long Name K', value: 1 },
      { name: 'Really Long Name L', value: 1 },
      { name: 'Really Long Name M', value: 1 },
      { name: 'Really Long Name N', value: 1 },
      { name: 'Really Long Name O', value: 1 },
      { name: 'Really Long Name P', value: 1 },
      { name: 'Really Long Name Q', value: 1 },
      { name: 'Really Long Name R', value: 1 },
      { name: 'Really Long Name S', value: 1 },
      { name: 'Really Long Name T', value: 1 },
      { name: 'Really Long Name U', value: 1 },
      { name: 'Really Long Name V', value: 1 },
      { name: 'Really Long Name W', value: 1 },
      { name: 'Really Long Name X', value: 1 },
      { name: 'Really Long Name Y', value: 1 },
      { name: 'Really Long Name Z', value: 1 }
    ]
  ];

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
        {/* <Grid item xs={12} sm={12} md={4}>
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
        </Grid> */}
        <Grid item xs={12}>
          <Box gap={2} display="flex" flexDirection="column">
            {testData.map((items) => {
              return <SpendingBar items={items} enableDebug={false} />;
            })}
          </Box>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default FinancePage;
