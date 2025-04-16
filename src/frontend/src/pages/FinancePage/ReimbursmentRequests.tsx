import { Box, Button, Menu, MenuItem, ListItemIcon, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useState } from 'react';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { SearchBar } from '../../components/SearchBar';
import { NERButton } from '../../components/NERButton';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WorkIcon from '@mui/icons-material/Work';
import { routes } from '../../utils/routes';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin, isGuest, isHead, isLead, ReimbursementStatusType } from 'shared';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReimbursementRequestTable from './ReimbursementRequestsSection';
import { useToast } from '../../hooks/toasts.hooks';
import {
  useAllReimbursementRequests,
  useCurrentUserReimbursementRequests,
  useDownloadCSVFileOfReimbursementRequests
} from '../../hooks/finance.hooks';
import { useHistory } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { DatePicker } from '@mui/x-date-pickers';
import { set } from 'react-hook-form';

const ReimbursementRequests: React.FC = () => {
  const ALL_STATUSES = Object.values(ReimbursementStatusType);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setAccountCreditModalShow] = useState<boolean>(false);
  const [, setShowPendingAdvisorListModal] = useState(false);
  const [, setShowGenerateReceipts] = useState(false);
  const [, setShowTotalAmountSpent] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const history = useHistory();
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

  const tableOffset = canViewAllReimbursementRequests ? -70 : 0;
  const searchOffset = canViewAllReimbursementRequests ? '0px' : '10px';

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

  const { data: userReimbursementRequests } = useCurrentUserReimbursementRequests();
  const { data: allReimbursementRequests } = useAllReimbursementRequests();

  const [searchText, setSearchText] = useState<string>('');
  const [anchorFilterEl, setAnchorFilterEl] = useState<null | HTMLElement>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<ReimbursementStatusType[]>([]);
  const [startDate, setStartDate] = useState<null | Date>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleFilterMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorFilterEl(e.currentTarget);
  const handleFilterMenuClose = () => {
    setAnchorFilterEl(null);
  };

  const filterMenu = (
    <Menu
      open={Boolean(anchorFilterEl)}
      anchorEl={anchorFilterEl}
      onClose={handleFilterMenuClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Filter by Status</Typography>
        {ALL_STATUSES.map((status) => {
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
              {status.replace(/_/g, ' ')}
            </MenuItem>
          );
        })}
        <Typography sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Filter by Date</Typography>
        <Box sx={{ mt: 2 }}>
          <DatePicker
            label="From"
            value={startDate}
            slotProps={{
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
        <Typography variant="h3" sx={{ fontSize: { xs: '1.4rem', sm: '1.75rem', md: '3rem' } }}>
          Reimbursement Requests
        </Typography>
        {!canViewAllReimbursementRequests && SearchAndFilterBar}
        {canViewAllReimbursementRequests && <Box sx={{ position: 'relative', top: '10px' }}> {financeActionsDropdown} </Box>}
      </Box>
      {canViewAllReimbursementRequests && SearchAndFilterBar}
      <Box sx={{ position: 'relative', top: tableOffset }}>
        <ReimbursementRequestTable
          userReimbursementRequests={userReimbursementRequests ?? []}
          allReimbursementRequests={allReimbursementRequests ?? []}
          searchText={searchText}
          statuses={selectedStatuses}
          startDate={startDate}
          endDate={endDate}
        />
      </Box>
    </Box>
  );
};

export default ReimbursementRequests;
