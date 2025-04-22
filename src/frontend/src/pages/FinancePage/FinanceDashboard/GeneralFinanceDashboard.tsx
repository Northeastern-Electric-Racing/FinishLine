import React, { useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageLayout from '../../../components/PageLayout';
import { Box } from '@mui/system';
import FullPageTabs from '../../../components/FullPageTabs';
import { routes } from '../../../utils/routes';
import { useAllReimbursementRequests, useGetPendingAdvisorList } from '../../../hooks/finance.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { NERButton } from '../../../components/NERButton';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useHistory } from 'react-router-dom';
import PendingAdvisorModal from '../FinanceComponents/PendingAdvisorListModal';
import TotalAmountSpentModal from '../FinanceComponents/TotalAmountSpentModal';
import { DatePicker } from '@mui/x-date-pickers';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WorkIcon from '@mui/icons-material/Work';
import { isGuest } from 'shared';
import { useGetUsersTeams } from '../../../hooks/teams.hooks';
import FinanceDashboardTeamView from './FinanceDashboardTeamView';

interface GeneralFinanceDashboardProps {
  startDate?: Date;
  endDate?: Date;
}

const GeneralFinanceDashboard: React.FC<GeneralFinanceDashboardProps> = ({ startDate, endDate }) => {
  const user = useCurrentUser();
  const history = useHistory();
  const {
    data: allTeams,
    isLoading: allTeamsIsLoading,
    isError: allTeamsIsError,
    error: allTeamsError
  } = useGetUsersTeams();
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

  if (allTeamsIsError) {
    return <ErrorPage error={allTeamsError} />;
  }

  if (!allTeams || allTeamsIsLoading) {
    return <LoadingIndicator />;
  }

  const tabs = allTeams.map((team) => ({
    tabUrlValue: team.teamId,
    tabName: team.teamName
  }));

  const { isFinance } = user;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const defaultTab = 'team';
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [showPendingAdvisorListModal, setShowPendingAdvisorListModal] = useState(false);
  const [showTotalAmountSpent, setShowTotalAmountSpent] = useState(false);
  const [startDateState, setStartDateState] = useState<Date | undefined>(startDate);
  const [endDateState, setEndDateState] = useState<Date | undefined>(endDate);

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
        <MenuItem onClick={() => history.push(routes.NEW_REIMBURSEMENT_REQUEST)} disabled={isGuest(user.role)}>
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          Pending Advisor List
        </MenuItem>
        <MenuItem onClick={() => setShowTotalAmountSpent(true)} disabled={!isFinance}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          Total Amount Spent
        </MenuItem>
      </Menu>
    </>
  );

  const selectedTab = tabs.at(tabIndex);

  return (
    <PageLayout
      title="Finance Budget Overview"
      headerRight={financeActionsDropdown}
      tabs={
        <Box borderBottom={1} borderColor="divider" width="100%">
          <FullPageTabs
            noUnderline
            setTab={setTabIndex}
            tabsLabels={tabs}
            baseUrl={routes.FINANCE_DASHBOARD}
            defaultTab={defaultTab}
            id="finance-dashboard-tabs"
          />
        </Box>
      }
    >
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

      <Box sx={{ mt: 2 }}>
        <DatePicker
          label="From"
          value={startDate}
          slotProps={{
            textField: { fullWidth: true },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => setStartDateState(newValue ?? undefined)}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <DatePicker
          label="Until"
          value={endDate}
          slotProps={{
            textField: { fullWidth: true },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => setEndDateState(newValue ?? undefined)}
        />
      </Box>
      { selectedTab && <FinanceDashboardTeamView teamId={selectedTab.tabUrlValue} /> }
    </PageLayout>
  );
};

export default GeneralFinanceDashboard;
