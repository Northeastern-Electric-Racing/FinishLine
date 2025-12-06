import React, { useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageLayout from '../../../components/PageLayout';
import { Box } from '@mui/system';
import FullPageTabs from '../../../components/FullPageTabs';
import { routes } from '../../../utils/routes';
import { useGetUsersTeams } from '../../../hooks/teams.hooks';
import FinanceDashboardTeamView from './FinanceDashboardTeamView';
import FinanceDashboardCarFilter from '../../../components/FinanceDashboardCarFilter';
import { useFinanceDashboardCarFilter } from '../../../hooks/finance-car-filter.hooks';

interface GeneralFinanceDashboardProps {
  startDate?: Date;
  endDate?: Date;
  carNumber?: number;
}

const GeneralFinanceDashboard: React.FC<GeneralFinanceDashboardProps> = ({ startDate, endDate, carNumber }) => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const filter = useFinanceDashboardCarFilter(startDate, endDate, carNumber);

  const {
    data: allTeams,
    isLoading: allTeamsIsLoading,
    isError: allTeamsIsError,
    error: allTeamsError
  } = useGetUsersTeams();

  if (allTeamsIsError) {
    return <ErrorPage error={allTeamsError} />;
  }

  if (!allTeams || allTeamsIsLoading || filter.isLoading) {
    return <LoadingIndicator />;
  }

  if (filter.error) {
    return <ErrorPage error={filter.error} />;
  }

  const filterComponent = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        mb: 2
      }}
    >
      <FinanceDashboardCarFilter filter={filter} size="small" />
    </Box>
  );

  if (allTeams.length === 0) {
    return (
      <PageLayout title={`Finance Budget Overview`} headerRight={filterComponent}>
        <Box mt={4}></Box>
      </PageLayout>
    );
  }

  if (allTeams.length === 1) {
    return (
      <PageLayout title={`Finance Budget Overview - ${allTeams[0].teamName}`} headerRight={filterComponent}>
        <Box mt={4}></Box>
        <FinanceDashboardTeamView
          teamId={allTeams[0].teamId}
          startDate={filter.startDate}
          endDate={filter.endDate}
          carNumber={filter.carNumber}
        />
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
      headerRight={filterComponent}
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
      {selectedTab && (
        <FinanceDashboardTeamView
          teamId={selectedTab.tabUrlValue}
          startDate={filter.startDate}
          endDate={filter.endDate}
          carNumber={filter.carNumber}
        />
      )}
    </PageLayout>
  );
};

export default GeneralFinanceDashboard;
