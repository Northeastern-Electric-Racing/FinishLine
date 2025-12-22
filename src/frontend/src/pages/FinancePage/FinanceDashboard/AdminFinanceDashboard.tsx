import React, { useEffect, useState } from 'react';
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
import { DatePicker } from '@mui/x-date-pickers';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WorkIcon from '@mui/icons-material/Work';
import { isAdmin, dateToUtcMidnight } from 'shared';
import { useGetAllCars } from '../../../hooks/cars.hooks';
import NERAutocomplete from '../../../components/NERAutocomplete';

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
  const [startDateState, setStartDateState] = useState<Date | undefined>(startDate);
  const [endDateState, setEndDateState] = useState<Date | undefined>(endDate);
  const [carNumberState, setCarNumberState] = useState<number | undefined>(carNumber);

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

  const { data: allCars, isLoading: allCarsIsLoading, isError: allCarsIsError, error: allCarsError } = useGetAllCars();

  useEffect(() => {
    if (carNumberState === undefined && allCars && allCars.length > 0) {
      setCarNumberState(allCars[allCars.length - 1].wbsNum.carNumber);
    }
  }, [allCars, carNumberState]);

  if (allCarsIsError) {
    return <ErrorPage error={allCarsError} />;
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
    !allCars ||
    allCarsIsLoading
  ) {
    return <LoadingIndicator />;
  }

  const carAutocompleteOptions = allCars.map((car) => ({
    label: car.name,
    id: car.wbsNum.carNumber.toString()
  }));

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
      <NERAutocomplete
        id="finance-admin-car-number"
        onChange={(_event, newValue) => setCarNumberState(newValue ? Number(newValue.id) : undefined)}
        options={carAutocompleteOptions}
        size="small"
        placeholder="Select A Car"
        value={
          carNumberState !== undefined ? carAutocompleteOptions.find((car) => car.id === carNumberState.toString()) : null
        }
        sx={datePickerStyle}
      />
      <DatePicker
        label="Start Date"
        value={startDateState}
        maxDate={endDateState || undefined}
        shouldDisableDate={(date) => (endDateState ? date > endDateState : false)}
        slotProps={{
          textField: {
            size: 'small',
            sx: datePickerStyle
          },
          field: { clearable: true }
        }}
        onChange={(newValue: Date | null) => setStartDateState(newValue ? dateToUtcMidnight(newValue) : undefined)}
      />

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '24px', margin: '0 8px' }}>-</span>
      </Box>

      <DatePicker
        label="End Date"
        value={endDateState}
        minDate={startDateState || undefined}
        shouldDisableDate={(date) => (startDateState ? date < startDateState : false)}
        slotProps={{
          textField: {
            size: 'small',
            sx: datePickerStyle
          },
          field: { clearable: true }
        }}
        onChange={(newValue: Date | null) => setEndDateState(newValue ? dateToUtcMidnight(newValue) : undefined)}
      />
      <Box sx={{ ml: 0 }}></Box>
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
        <FinanceDashboardAllView startDate={startDateState} endDate={endDateState} carNumber={carNumberState} />
      ) : tabIndex === tabs.length - 1 ? (
        <FinanceDashboardCategoriesView startDate={startDateState} endDate={endDateState} carNumber={carNumberState} />
      ) : (
        selectedTab && (
          <FinanceDashboardTeamTypeView
            teamTypeId={selectedTab.tabUrlValue}
            startDate={startDateState}
            endDate={endDateState}
            carNumber={carNumberState}
          />
        )
      )}
    </PageLayout>
  );
};

export default AdminFinanceDashboard;
