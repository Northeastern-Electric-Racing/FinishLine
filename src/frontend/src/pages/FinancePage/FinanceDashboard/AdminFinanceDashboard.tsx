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
import { ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import PendingAdvisorModal from '../FinanceComponents/PendingAdvisorListModal';
import TotalAmountSpentModal from '../FinanceComponents/TotalAmountSpentModal';
import { DatePicker } from '@mui/x-date-pickers';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WorkIcon from '@mui/icons-material/Work';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { isAdmin } from 'shared';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useFinanceDashboardCarFilter } from '../../../hooks/finance-car-filter.hooks';

interface AdminFinanceDashboardProps {
  startDate?: Date;
  endDate?: Date;
}

const AdminFinanceDashboard: React.FC<AdminFinanceDashboardProps> = ({ startDate, endDate }) => {
  const user = useCurrentUser();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [showPendingAdvisorListModal, setShowPendingAdvisorListModal] = useState(false);
  const [showTotalAmountSpent, setShowTotalAmountSpent] = useState(false);

  const filter = useFinanceDashboardCarFilter(startDate, endDate);

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

  const ALL_CARS_ID = '__ALL_CARS__';
  const { selectedCar, allCars } = filter;
  const sortedCars = [...allCars].sort((a, b) => b.wbsNum.carNumber - a.wbsNum.carNumber);
  const carOptions = sortedCars.map((car) => ({
    label: car.wbsNum.carNumber === 0 ? car.name : `${car.name} (Car ${car.wbsNum.carNumber})`,
    id: car.id
  }));
  const carAutocompleteOptions = [{ label: 'All Cars', id: ALL_CARS_ID }, ...carOptions];

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

  const datePickerStyle = {
    width: 150,
    height: 36,
    color: 'white',
    fontSize: '13px',
    textTransform: 'none',
    fontWeight: 400,
    borderRadius: '4px',
    boxShadow: 'none',

    '.MuiInputBase-root': {
      height: '36px',
      padding: '0 8px',
      backgroundColor: '#ef4345',
      color: 'white',
      fontSize: '13px',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: '#ef4345'
      },
      '&.Mui-focused': {
        backgroundColor: '#ef4345',
        color: 'white'
      }
    },

    '.MuiInputLabel-root': {
      color: 'white',
      fontSize: '14px',
      transform: 'translate(15px, 7px) scale(1)',
      '&.Mui-focused': {
        color: 'white'
      }
    },

    '.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
      color: 'white'
    },

    '& .MuiInputBase-input': {
      color: 'white',
      paddingTop: '8px',
      cursor: 'pointer',
      '&:focus': {
        color: 'white'
      }
    },

    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #fff',
      '&:hover': {
        borderColor: '#fff'
      },
      '&.Mui-focused': {
        borderColor: '#fff'
      }
    },

    '& .MuiSvgIcon-root': {
      color: 'white',
      '&:hover': {
        color: 'white'
      },
      '&.Mui-focused': {
        color: 'white'
      }
    }
  };

  const dateAndActionsDropdown = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'nowrap',
        width: 'auto',
        maxWidth: '100%',
        flexShrink: 1,
        justifyContent: 'flex-end',
        ml: 'auto'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <NERAutocomplete
          id="finance-admin-car-number"
          onChange={(_event, newValue) => {
            if (newValue === null) {
              // Cleared (X button) — re-mirror global
              filter.clearLocalSelection();
            } else if (newValue.id === ALL_CARS_ID) {
              // Explicit "All Cars" override
              filter.setSelectedCar('all-cars');
            } else {
              const car = allCars.find((c) => c.id === newValue.id);
              if (car) filter.setSelectedCar(car);
            }
          }}
          options={carAutocompleteOptions}
          size="small"
          placeholder="Select A Car"
          value={
            selectedCar === 'all-cars'
              ? { label: 'All Cars', id: ALL_CARS_ID }
              : (carOptions.find((car) => car.id === selectedCar.id) ?? null)
          }
          sx={datePickerStyle}
        />
        <Tooltip
          title="Select a car to filter finance data. When you select a car, dates will help you view data for that car's timeline."
          placement="top"
        >
          <HelpIcon fontSize="small" sx={{ color: 'white', cursor: 'pointer' }} />
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <DatePicker
          label="Start Date"
          value={filter.startDate}
          maxDate={filter.endDate || undefined}
          shouldDisableDate={(date) => (filter.endDate ? date > filter.endDate : false)}
          slotProps={{
            textField: {
              size: 'small',
              sx: datePickerStyle
            },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => filter.setStartDate(newValue ?? undefined)}
        />
        <Tooltip
          title="Start date filters for car-specific data and non-car/category data (e.g., competitions, food, etc.)."
          placement="top"
        >
          <HelpIcon fontSize="small" sx={{ color: 'white', cursor: 'pointer' }} />
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '24px', margin: '0 8px' }}>-</span>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <DatePicker
          label="End Date"
          value={filter.endDate}
          minDate={filter.startDate || undefined}
          shouldDisableDate={(date) => (filter.startDate ? date < filter.startDate : false)}
          slotProps={{
            textField: {
              size: 'small',
              sx: datePickerStyle
            },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => filter.setEndDate(newValue ?? undefined)}
        />
        <Tooltip
          title="End date filters for car-specific data and non-car/category data. Use this with start date to define your data range."
          placement="top"
        >
          <HelpIcon fontSize="small" sx={{ color: 'white', cursor: 'pointer' }} />
        </Tooltip>
      </Box>
      <Box sx={{ ml: 0 }}></Box>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="project-actions-dropdown"
        onClick={handleClick}
        sx={{ flexShrink: 0 }}
      >
        Actions
      </NERButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem
          onClick={() => {
            handleDropdownClose();
            setShowPendingAdvisorListModal(true);
          }}
          disabled={!isFinance && !isAdmin(user.role)}
        >
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          Pending Advisor List
        </MenuItem>
        <MenuItem onClick={() => setShowTotalAmountSpent(true)} disabled={!isFinance && !isAdmin(user.role)}>
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
        <FinanceDashboardAllView
          startDate={filter.startDate}
          endDate={filter.endDate}
          overrideCarId={selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id}
        />
      ) : tabIndex === tabs.length - 1 ? (
        <FinanceDashboardCategoriesView
          startDate={filter.startDate}
          endDate={filter.endDate}
          overrideCarId={selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id}
        />
      ) : (
        selectedTab && (
          <FinanceDashboardTeamTypeView
            teamTypeId={selectedTab.tabUrlValue}
            startDate={filter.startDate}
            endDate={filter.endDate}
            overrideCarId={selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id}
          />
        )
      )}
    </PageLayout>
  );
};

export default AdminFinanceDashboard;
