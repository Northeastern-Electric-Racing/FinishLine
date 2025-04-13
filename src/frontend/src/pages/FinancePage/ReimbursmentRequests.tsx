import { Box, Button, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
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
import { isAdmin, isGuest } from 'shared';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReimbursementRequestTable from './ReimbursementRequestsSection';
import { useToast } from '../../hooks/toasts.hooks';
import {
  useAllReimbursementRequests,
  useCurrentUserReimbursementRequests,
  useDownloadCSVFileOfReimbursementRequests
} from '../../hooks/finance.hooks';
import { useAllTeams } from '../../hooks/teams.hooks';
import { useHistory } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useAllProjects } from '../../hooks/projects.hooks';

const ReimbursementRequests: React.FC = () => {
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
  const { data: allTeams } = useAllTeams();
  const { data: allProjects } = useAllProjects();

  const [searchText, setSearchText] = useState<string>('');

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
        {financeActionsDropdown}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Box sx={{ ml: 'auto', width: { xs: '150px', sm: '200px', md: '250px', zIndex: 2 } }}>
          <SearchBar placeholder="Search" searchText={searchText} setSearchText={setSearchText} />
        </Box>
        <Button color="primary" aria-label="filter" sx={{ zIndex: 1 }}>
          <FilterListIcon sx={{ fontSize: { xs: '1.25rem', sm: '2.5rem', zIndex: 2 } }} />
          <Typography variant="button" sx={{ fontSize: { xs: '0.5rem', sm: '1.200rem', zIndex: 1 } }}>
            Filters
          </Typography>
        </Button>
      </Box>
      <Box sx={{ position: 'relative', top: -70 }}>
        <ReimbursementRequestTable
          userReimbursementRequests={userReimbursementRequests ?? []}
          allReimbursementRequests={allReimbursementRequests ?? []}
          allTeams={allTeams ?? []}
          allProjects={allProjects ?? []}
          searchText={searchText}
        />
      </Box>
    </Box>
  );
};

export default ReimbursementRequests;
