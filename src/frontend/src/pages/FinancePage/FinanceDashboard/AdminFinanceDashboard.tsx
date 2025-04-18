import React, { useState } from 'react';
import { useAllTeamTypes } from '../../../hooks/team-types.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageLayout from '../../../components/PageLayout';
import { Box } from '@mui/system';
import FullPageTabs from '../../../components/FullPageTabs';
import { routes } from '../../../utils/routes';

const AdminFinanceDashboard: React.FC = () => {
  const {
    data: allTeamTypes,
    isLoading: allTeamTypesIsLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();

  if (allTeamTypesIsError) {
    return <ErrorPage error={allTeamTypesError} />;
  }

  if (!allTeamTypes || allTeamTypesIsLoading) {
    return <LoadingIndicator />;
  }

  const defaultTab = 'All';
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [];

  tabs.push({ tabUrlValue: 'all', tabName: 'All' });
  allTeamTypes.forEach((team) => {
    tabs.push({
      tabUrlValue: team.teamTypeId,
      tabName: team.name
    });
  });
  tabs.push({ tabUrlValue: 'categories', tabName: 'Categories' });

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
            defaultTab={defaultTab}
            id="finance-dashboard-tabs"
          />
        </Box>
      }
    >
      {tabIndex === 0 ? (
        <>
          <FinanceDashboardAllView />
        </>
      ) : tabIndex === 5 ? (
        <FinanceDashboardCategoriesView />
      ) : (
        <FinanceDashboardTeamTypeView team={tabs.at(tabIndex)?.tabUrlValue} />
      )}
    </PageLayout>
  );
};
