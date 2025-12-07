import React, { useState } from 'react';
import { useAllTeamTypes } from '../../../hooks/team-types.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageLayout from '../../../components/PageLayout';
import { Box } from '@mui/system';
import FullPageTabs from '../../../components/FullPageTabs';
import { routes } from '../../../utils/routes';
import FinanceDashboardAllView from './FinanceDashboardAllView';
import FinanceDashboardCategoriesView from './FinanceDashboardCategoriesView';
import FinanceDashboardTeamTypeView from './FinanceDashboardTeamTypeView';
import { useAllReimbursementRequests, useGetPendingAdvisorList } from '../../../hooks/finance.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { NERButton } from '../../../components/NERButton';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import PendingAdvisorModal from '../FinanceComponents/PendingAdvisorListModal';
import TotalAmountSpentModal from '../FinanceComponents/TotalAmountSpentModal';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WorkIcon from '@mui/icons-material/Work';
import { isAdmin } from 'shared';
import FinanceDashboardCarFilter from '../../../components/FinanceDashboardCarFilter';
import { useFinanceDashboardCarFilter } from '../../../hooks/finance-car-filter.hooks';

interface AdminFinanceDashboardProps {
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

const AdminFinanceDashboard: React.FC<AdminFinanceDashboardProps> = ({ startDate, endDate, carNumber }) => {
  const user = useCurrentUser();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [showPendingAdvisorListModal, setShowPendingAdvisorListModal] = useState(false);
  const [showTotalAmountSpent, setShowTotalAmountSpent] = useState(false);

  const filter = useFinanceDashboardCarFilter(startDate, endDate, carNumber);

  const {
    data: allTeamTypes,
    isLoading: allTeamTypesIsLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();
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

  if (filter.error) {
    return <ErrorPage error={filter.error} />;
  }

  if (allTeamTypesIsError) {
    return <ErrorPage error={allTeamTypesError} />;
  }

  if (allReimbursementRequestsIsError) {
    return <ErrorPage error={allReimbursementRequestsError} />;
  }

  if (allPendingAdvisorListIsError) {
    return <ErrorPage error={allPendingAdvisorListError} />;
  }

  if (
    !allTeamTypes ||
    allTeamTypesIsLoading ||
    !allReimbursementRequests ||
    allReimbursementRequestsIsLoading ||
    !allPendingAdvisorList ||
    allPendingAdvisorListIsLoading ||
    filter.isLoading
  ) {
    return <LoadingIndicator />;
  }

  const tabs = [];

  tabs.push({ tabUrlValue: 'all', tabName: 'All' });
  allTeamTypes.forEach((team) => {
    tabs.push({
      tabUrlValue: team.teamTypeId,
      tabName: team.name
    });
  });
  tabs.push({ tabUrlValue: 'categories', tabName: 'Categories' });

  const { isFinance } = user;

  const defaultTab = 'all';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const dateAndActionsDropdown = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        flexWrap: 'nowrap',
        width: 'auto',
        maxWidth: '100%',
        flexShrink: 1,
        justifyContent: 'flex-end',
        ml: 'auto'
      }}
    >
      <FinanceDashboardCarFilter filter={filter} size="small" />
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
            handleDropdownClose();
            setShowPendingAdvisorListModal(true);
          }}
          disabled={!isFinance && !isAdmin}
        >
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          Pending Advisor List
        </MenuItem>
        <MenuItem onClick={() => setShowTotalAmountSpent(true)} disabled={!isFinance && !isAdmin}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          Total Amount Spent
        </MenuItem>
      </Menu>
    </Box>
  );

  const selectedTab = tabs.at(tabIndex);

  return (
    <PageLayout
      title="Finance Budget Overview"
      headerRight={dateAndActionsDropdown}
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
      {(isFinance || isAdmin(user.role)) && (
        <PendingAdvisorModal
          open={showPendingAdvisorListModal}
          saboNumbers={allPendingAdvisorList!.map((reimbursementRequest) => reimbursementRequest.saboId!)}
          onHide={() => setShowPendingAdvisorListModal(false)}
        />
      )}
      {(isFinance || isAdmin(user.role)) && (
        <TotalAmountSpentModal
          open={showTotalAmountSpent}
          allReimbursementRequests={allReimbursementRequests!}
          onHide={() => setShowTotalAmountSpent(false)}
        />
      )}
      {tabIndex === 0 ? (
        <FinanceDashboardAllView startDate={filter.startDate} endDate={filter.endDate} carNumber={filter.carNumber} />
      ) : tabIndex === tabs.length - 1 ? (
        <FinanceDashboardCategoriesView startDate={filter.startDate} endDate={filter.endDate} carNumber={filter.carNumber} />
      ) : (
        selectedTab && (
          <FinanceDashboardTeamTypeView
            teamTypeId={selectedTab.tabUrlValue}
            startDate={filter.startDate}
            endDate={filter.endDate}
            carNumber={filter.carNumber}
          />
        )
      )}
    </PageLayout>
  );
};

export default AdminFinanceDashboard;
