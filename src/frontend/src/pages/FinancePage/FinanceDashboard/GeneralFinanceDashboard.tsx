import React, { useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageLayout from '../../../components/PageLayout';
import { Box } from '@mui/system';
import FullPageTabs from '../../../components/FullPageTabs';
import { routes } from '../../../utils/routes';
import { DatePicker } from '@mui/x-date-pickers';
import { useGetUsersTeams } from '../../../hooks/teams.hooks';
import FinanceDashboardTeamView from './FinanceDashboardTeamView';

interface GeneralFinanceDashboardProps {
  startDate?: Date;
  endDate?: Date;
}

const GeneralFinanceDashboard: React.FC<GeneralFinanceDashboardProps> = ({ startDate, endDate }) => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [startDateState, setStartDateState] = useState<Date | undefined>(startDate);
  const [endDateState, setEndDateState] = useState<Date | undefined>(endDate);

  const {
    data: allTeams,
    isLoading: allTeamsIsLoading,
    isError: allTeamsIsError,
    error: allTeamsError
  } = useGetUsersTeams();

  if (allTeamsIsError) {
    return <ErrorPage error={allTeamsError} />;
  }

  if (!allTeams || allTeamsIsLoading) {
    return <LoadingIndicator />;
  }

  console.log(allTeams);

  const datePickerStyle = {
    width: 120,
    height: 36,
    backgroundColor: '#ef4345',
    color: 'white',
    fontSize: '13px',
    textTransform: 'none',
    fontWeight: 400,
    border: '1px solid #ef4345',
    borderRadius: '4px',
    boxShadow: 'none',

    '.MuiInputBase-root': {
      height: '36px',
      padding: '0 8px',
      color: 'white',
      fontSize: '13px'
    },

    '.MuiInputLabel-root': {
      color: 'white',
      fontSize: '13px',
      transform: 'translate(15px, 8px) scale(1)'
    },

    '.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
      color: 'white'
    },

    '& .MuiInputBase-input': {
      color: 'white',
      paddingTop: '8px',
      cursor: 'pointer'
    },

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff'
    },

    '& .MuiSvgIcon-root': {
      color: 'white'
    }
  };

  const dates = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        mb: 2,
        gap: 2,
        flexWrap: 'wrap'
      }}
    >
      <DatePicker
        label="Start Date"
        value={startDateState}
        slotProps={{
          textField: {
            size: 'small',
            sx: datePickerStyle
          },
          field: { clearable: true }
        }}
        onChange={(newValue: Date | null) => setStartDateState(newValue ?? undefined)}
      />

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '24px', margin: '0 8px' }}>-</span>
      </Box>

      <DatePicker
        label="End Date"
        value={endDateState}
        slotProps={{
          textField: {
            size: 'small',
            sx: datePickerStyle
          },
          field: { clearable: true }
        }}
        onChange={(newValue: Date | null) => setEndDateState(newValue ?? undefined)}
      />
    </Box>
  );

  if (allTeams.length === 1) {
    return (
      <PageLayout title={`Finance Budget Overview - ${allTeams[0].teamName}`} headerRight={dates}>
        <Box mt={4}></Box>
        <FinanceDashboardTeamView teamId={allTeams[0].teamId} />
      </PageLayout>
    );
  }

  const tabs = allTeams.map((team) => ({
    tabUrlValue: team.teamId,
    tabName: team.teamName
  }));

  const defaultTab = 'team';

  const selectedTab = tabs.at(tabIndex);

  return (
    <PageLayout
      title={`Finance Budget Overview - ${selectedTab?.tabName}`}
      headerRight={dates}
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
      {selectedTab && <FinanceDashboardTeamView teamId={selectedTab.tabUrlValue} />}
    </PageLayout>
  );
};

export default GeneralFinanceDashboard;
