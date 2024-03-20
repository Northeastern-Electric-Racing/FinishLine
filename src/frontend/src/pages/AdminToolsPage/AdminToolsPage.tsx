/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AdminToolsUserManagement from './AdminToolsUserManagement';
import AdminToolsSlackUpcomingDeadlines from './AdminToolsSlackUpcomingDeadlines';
import AdminToolsAttendeeDesignReviewInfo from './AdminToolsAttendeeDesignReviewInfo';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin, isHead } from 'shared';
import PageLayout from '../../components/PageLayout';
import AdminToolsFinanceConfig from './AdminToolsFinanceConfig';
import TeamsTools from './TeamsTools';
import AdminToolsBOMConfig from './AdminToolsBOMConfig';
import AdminToolsProjectsConfig from './AdminToolsProjectsConfig';
import { useState } from 'react';
import NERTabs from '../../components/Tabs';
import { routes } from '../../utils/routes';
import { Box } from '@mui/material';

const AdminToolsPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const [tabIndex, setTabIndex] = useState<number>(0);

  const isUserHead = isHead(currentUser.role);
  const isUserAdmin = isAdmin(currentUser.role);
  const isUserFinanceLead = currentUser.isAtLeastFinanceLead;

  const defaultTab = isUserAdmin || isUserHead ? 'user-management' : 'finance-configuration';

  const tabs = [];

  if (isUserHead || isUserAdmin) {
    tabs.push({ tabUrlValue: 'user-management', tabName: 'User Management' });
    tabs.push({ tabUrlValue: 'project-configuration', tabName: 'Project Configuration' });
  }
  if (isUserAdmin || isUserFinanceLead) {
    tabs.push({ tabUrlValue: 'finance-configuration', tabName: 'Finance Configuration' });
  }
  if (isUserAdmin) {
    tabs.push({ tabUrlValue: 'miscellaneous', tabName: 'Miscellaneous' });
  }

  const UserManagementTab = () => {
    return isUserAdmin ? (
      <>
        <AdminToolsUserManagement />
        <TeamsTools />
      </>
    ) : (
      <AdminToolsUserManagement />
    );
  };

  const ProjectConfigurationTab = () => {
    return isUserAdmin ? (
      <>
        <AdminToolsProjectsConfig />
        <AdminToolsBOMConfig />
      </>
    ) : (
      <AdminToolsProjectsConfig />
    );
  };

  return (
    <PageLayout
      title="Admin Tools"
      tabs={
        <Box borderBottom={1} borderColor={'divider'} width={'100%'}>
          <NERTabs
            noUnderline
            setTab={setTabIndex}
            tabsLabels={tabs}
            baseUrl={routes.ADMIN_TOOLS}
            defaultTab={defaultTab}
            id="admin-tools-tabs"
          />
        </Box>
      }
    >
      {tabIndex === 0 ? (
        <UserManagementTab />
      ) : tabIndex === 1 ? (
        <ProjectConfigurationTab />
      ) : tabIndex === 2 ? (
        <AdminToolsFinanceConfig />
      ) : (
        <>
          <AdminToolsSlackUpcomingDeadlines />
          <AdminToolsAttendeeDesignReviewInfo />
        </>
      )}
    </PageLayout>
  );
};

export default AdminToolsPage;
