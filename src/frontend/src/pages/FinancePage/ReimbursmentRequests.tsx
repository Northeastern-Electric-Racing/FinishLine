import { Box, Button, Menu, MenuItem, ListItemIcon, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useMemo, useState } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { SearchBar } from '../../components/SearchBar';
import { NERButton } from '../../components/NERButton';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WorkIcon from '@mui/icons-material/Work';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin, isGuest, isHead, isLead, ReimbursementStatusType } from 'shared';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReimbursementRequestTable from './ReimbursementRequestsSection';
import { useToast } from '../../hooks/toasts.hooks';
import {
  useAllReimbursementRequests,
  useCurrentUserAssignedReimbursementRequests,
  useCurrentUserReimbursementRequests,
  useDownloadCSVFileOfReimbursementRequests
} from '../../hooks/finance.hooks';
import { DatePicker } from '@mui/x-date-pickers';
import ReportRefundModal from './FinanceComponents/ReportRefundModal';
import GenerateReceiptsModal from './FinanceComponents/GenerateReceiptsModal';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';

const ReimbursementRequests: React.FC = () => {
  const allStatuses = Object.values(ReimbursementStatusType);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountCreditModalShow, setAccountCreditModalShow] = useState<boolean>(false);
  const [showGenerateReceipts, setShowGenerateReceipts] = useState(false);

  const user = useCurrentUser();
  const canViewAllReimbursementRequests = user.isFinance || isHead(user.role) || isLead(user.role);
  const toast = useToast();
  const { isFinance } = user;
  const { mutateAsync: downloadCSVFileOfReimbursementRequests } = useDownloadCSVFileOfReimbursementRequests();

  const downloadReimbursementRequests = async () => {
    try {
      await downloadCSVFileOfReimbursementRequests();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const tableOffset = canViewAllReimbursementRequests ? -70 : 0;
  const searchOffset = canViewAllReimbursementRequests ? '0px' : '10px';

  const financeActionsDropdown = (
    <>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="project-actions-dropdown"
        onClick={handleClick}
        sx={{
          color: 'white'
        }}
      >
        Actions
      </NERButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleDropdownClose}>
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
        <MenuItem onClick={() => setShowGenerateReceipts(true)} disabled={!isFinance}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          Generate All Receipts
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

  const {
    data: createdReimbursementRequests,
    refetch: refetchCreatedReimbursementRequests,
    isError: createdReimbursementRequestIsError,
    error: createdReimbursementRequestError
  } = useCurrentUserReimbursementRequests();
  const {
    data: assignedReimbursementRequests,
    refetch: refetchAssignedReimbursementRequests,
    isError: assignedReimbursementRequestIsError,
    error: assignedReimbursementRequestError
  } = useCurrentUserAssignedReimbursementRequests();
  const {
    data: allReimbursementRequests,
    refetch: refetchAllReimbursementRequests,
    isError: allReimbursementRequestsIsError,
    error: allReimbursementRequestsError
  } = useAllReimbursementRequests();

  const [searchText, setSearchText] = useState<string>('');
  const [anchorFilterEl, setAnchorFilterEl] = useState<null | HTMLElement>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<ReimbursementStatusType[]>([]);
  const [startDate, setStartDate] = useState<null | Date>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const clearData = () => {
    setSelectedStatuses([]);
    setStartDate(null);
    setEndDate(null);
  };

  const handleFilterMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorFilterEl(e.currentTarget);
  const handleFilterMenuClose = () => {
    setAnchorFilterEl(null);
  };

  if (isFinance && allReimbursementRequestsIsError) return <ErrorPage message={allReimbursementRequestsError?.message} />;
  if (assignedReimbursementRequestIsError) return <ErrorPage message={assignedReimbursementRequestError?.message} />;
  if (createdReimbursementRequestIsError) return <ErrorPage message={createdReimbursementRequestError?.message} />;

  const filterMenu = (
    <Menu
      open={Boolean(anchorFilterEl)}
      anchorEl={anchorFilterEl}
      onClose={handleFilterMenuClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ ml: 2, mr: 2, mt: 1 }}>
        <Box sx={{ display: 'inline-flex', mb: 1 }}>
          <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Filter by Status</Typography>
          <Box sx={{ ml: 20 }}>
            <Button
              className="viewButton"
              size="small"
              variant="contained"
              onClick={clearData}
              sx={{
                borderRadius: '8px',
                color: '#ededed',
                backgroundColor: '#dd514c',
                boxShadow: '0px 4px rgba(0,0,0,0.3)',
                padding: '2px 6px',
                '&:hover': {
                  backgroundColor: '#c74340'
                }
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            borderBottom: '2px solid white',
            mb: 2
          }}
        />
        {allStatuses.map((status) => {
          const isChecked = selectedStatuses.includes(status);
          return (
            <MenuItem
              onClick={() => {
                if (isChecked) {
                  setSelectedStatuses(selectedStatuses.filter((s) => status !== s));
                } else {
                  setSelectedStatuses([...selectedStatuses, status]);
                }
              }}
            >
              <FormControlLabel control={<Checkbox checked={isChecked} />} label="" />
              <Typography sx={{ fontWeight: 'bold' }}>{status.replace(/_/g, ' ')}</Typography>
            </MenuItem>
          );
        })}
        <Typography sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Filter by Date</Typography>
        <Box
          sx={{
            borderBottom: '2px solid white',
            mb: 2
          }}
        />
        <Box sx={{ mt: 2 }}>
          <DatePicker
            label="From"
            value={startDate}
            slotProps={{
              textField: {
                fullWidth: true
              },
              field: { clearable: true }
            }}
            onChange={(newValue: Date | null) => setStartDate(newValue)}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <DatePicker
            label="Until"
            value={endDate}
            slotProps={{
              textField: {
                fullWidth: true
              },
              field: { clearable: true }
            }}
            onChange={(newValue: Date | null) => setEndDate(newValue)}
          />
        </Box>
      </Box>
    </Menu>
  );

  const SearchAndFilterBar = (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative', top: searchOffset }}>
      <Box sx={{ ml: 'auto', width: { xs: '150px', sm: '200px', md: '250px', zIndex: 2 } }}>
        <SearchBar placeholder="Search" searchText={searchText} setSearchText={setSearchText} />
      </Box>
      <Button color="primary" aria-label="filter" onClick={handleFilterMenuOpen} sx={{ zIndex: 1 }}>
        <FilterListIcon sx={{ fontSize: { xs: '1.25rem', sm: '2.5rem', zIndex: 2 } }} />
        <Typography variant="button" sx={{ fontSize: { xs: '0.5rem', sm: '1.200rem', zIndex: 1 } }}>
          Filters
        </Typography>
      </Button>
      {filterMenu}
    </Box>
  );

  return (
    <Box sx={{ padding: '5px', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <GenerateReceiptsModal
          open={showGenerateReceipts}
          setOpen={setShowGenerateReceipts}
          allReimbursementRequests={allReimbursementRequests}
        />
        <ReportRefundModal showModal={accountCreditModalShow} handleClose={() => setAccountCreditModalShow(false)} />
        <Typography variant="h3" sx={{ fontSize: { xs: '1.4rem', sm: '1.75rem', md: '3rem' } }}>
          Reimbursement Requests
        </Typography>
        {!canViewAllReimbursementRequests && SearchAndFilterBar}
        {canViewAllReimbursementRequests && <Box sx={{ position: 'relative', top: '10px' }}> {financeActionsDropdown} </Box>}
      </Box>
      {canViewAllReimbursementRequests && SearchAndFilterBar}
      <Box sx={{ position: 'relative', top: tableOffset }}>
        <ReimbursementRequestTable
          userReimbursementRequests={createdReimbursementRequests ?? []}
          assignedReimbursementRequests={assignedReimbursementRequests ?? []}
          allReimbursementRequests={allReimbursementRequests ?? []}
          searchText={searchText}
          statuses={selectedStatuses}
          startDate={startDate}
          endDate={endDate}
          onCloseSidePage={() => {
            refetchCreatedReimbursementRequests();
            refetchAllReimbursementRequests();
            refetchAssignedReimbursementRequests();
          }}
        />
      </Box>
    </Box>
  );
};

export default ReimbursementRequests;
