import React, { useState } from 'react';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageLayout from '../../../components/PageLayout';
import { Box } from '@mui/system';
import FullPageTabs from '../../../components/FullPageTabs';
import { routes } from '../../../utils/routes';
import { useGetUsersTeams } from '../../../hooks/teams.hooks';

const GeneralFinanceDashboard: React.FC = () => {
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

  const tabs = allTeams.map((team) => ({
    tabUrlValue: team.teamId,
    tabName: team.teamName
  }));

  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <PageLayout
      title="Finance Budget Overview"
      tabs={
        <Box borderBottom={1} borderColor={'divider'} width={'100%'}>
          <FullPageTabs
            noUnderline
            setTab={setTabIndex}
            tabsLabels={tabs}
            baseUrl={routes.FINANCE_DASHBOARD}
            defaultTab={'team'}
            id="finance-dashboard-tabs"
          />
        </Box>
      }
    >
      <FinanceDashboardTeamView team={tabs.at(tabIndex)?.tabUrlValue} />
    </PageLayout>
  );
};

export default GeneralFinanceDashboard;
