import { Box } from '@mui/system';
import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import NERTabs from '../../components/Tabs';
import { routes } from '../../utils/routes';
import { Typography } from '@mui/material';
import { useCurrentUser, useUserTeams } from '../../hooks/users.hooks';
import { isAdmin } from 'shared';
import { useQuery } from 'react-query';
import { getAllTeams } from '../../apis/teams.api';

const FinanceDashboard: React.FC = () => {
  const currentUser = useCurrentUser();
  const { data: allTeams, isLoading: isLoadingAllTeams } = useQuery('allTeams', getAllTeams);
  const { data: userTeams, isLoading: isLoadingUserTeams } = useUserTeams(currentUser.userId);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const defaultTab = 'all';
  const tabs: { tabUrlValue: string; tabName: string }[] = [];

  if (!isLoadingAllTeams && !isLoadingUserTeams) {
    if (currentUser.isFinance || isAdmin(currentUser.role)) {
      tabs.push({ tabUrlValue: 'all', tabName: 'All' });
      allTeams?.data.forEach((team) => {
        tabs.push({ tabUrlValue: team.teamId, tabName: team.teamName });
      });
      tabs.push({ tabUrlValue: 'categories', tabName: 'Categories' });
    } else {
      userTeams?.forEach((team) => {
        tabs.push({ tabUrlValue: team.teamId, tabName: team.teamName });
      });
    }
  }

  return (
    <Box>
      <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '3rem' } }}>
        Finance Budget Overview
      </Typography>
      <PageLayout
        title=" "
        tabs={
          <NERTabs
            setTab={setTabIndex}
            tabsLabels={tabs}
            baseUrl={routes.FINANCE_DASHBOARD}
            defaultTab={defaultTab}
            id="finance-dashboard-tabs"
          />
        }
      >
        {tabs[tabIndex]?.tabUrlValue === 'all' && <div>All</div>}
        {tabs[tabIndex]?.tabUrlValue === 'categories' && <div>Categories</div>}
        {allTeams?.data.some((team) => team.teamId === tabs[tabIndex]?.tabUrlValue) && <div>{tabs[tabIndex]?.tabName}</div>}
      </PageLayout>
    </Box>
  );
};

export default FinanceDashboard;
