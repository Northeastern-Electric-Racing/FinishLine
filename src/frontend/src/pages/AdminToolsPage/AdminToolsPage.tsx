/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import AdminToolsUserManagement from './AdminToolsUserManagement';
import AdminToolsSlackUpcomingDeadlines from './AdminToolsSlackUpcomingDeadlines';
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

const AdminToolsPage: React.FC = () => {
  const currentUser = useCurrentUser();

  const [tabIndex, setTabIndex] = useState<number>(0);

  /*
  User Management Tab
  {isHead(currentUser.role) && <AdminToolsUserManagement />}
  {isAdmin(currentUser.role) && <TeamsTools />}

  Project Configuration Tab
  {isAdmin(currentUser.role) && <AdminToolsBOMConfig />}
  {isHead(currentUser.role) && <AdminToolsProjectsConfig />}



  Finance Configuration Tab
  {(isAdmin(currentUser.role) || currentUser.isAtLeastFinanceLead) && <AdminToolsFinanceConfig />}


  Miscellaneous Tab
  {isAdmin(currentUser.role) && <AdminToolsSlackUpcomingDeadlines />}
  */

  const isUserHead = isHead(currentUser.role);
  const isUserAdmin = isAdmin(currentUser.role);
  const isUserFinanceLead = currentUser.isAtLeastFinanceLead;

  const defaultTab = isUserAdmin || isUserHead ? 'user-management' : 'finance-configuration';

  const tabs = [
    { tabUrlValue: 'user-management', tabName: 'User Management', roles: ['head', 'admin'] },
    { tabUrlValue: 'project-configuration', tabName: 'Project Configuration', roles: ['head', 'admin'] },
    { tabUrlValue: 'finance-configuration', tabName: 'Finance Configuration', roles: ['financeLead', 'admin'] },
    { tabUrlValue: 'miscellaneous', tabName: 'Miscellaneous', roles: ['admin'] }
  ];

  const userRole = isUserAdmin ? 'admin' : isUserHead ? 'head' : isUserFinanceLead ? 'financeLead' : 'user';

  const filteredTabs = tabs.filter((tab) => tab.roles.includes(userRole));

  const showUserManagement = () => {
    return isUserAdmin ? <TeamsTools /> : <AdminToolsUserManagement />;
  };

  const showProjectConfiguration = () => {
    return isUserAdmin ? <AdminToolsBOMConfig /> : <AdminToolsProjectsConfig />;
  };

  return (
    <PageLayout
      title="Admin Tools"
      tabs={
        <NERTabs
          setTab={setTabIndex}
          tabsLabels={filteredTabs}
          baseUrl={routes.ADMIN_TOOLS}
          defaultTab={defaultTab}
          id="admin-tabs"
        />
      }
    >
      {tabIndex === 0 ? (
        showUserManagement()
      ) : tabIndex === 1 ? (
        showProjectConfiguration()
      ) : tabIndex === 2 ? (
        <AdminToolsFinanceConfig />
      ) : (
        <AdminToolsSlackUpcomingDeadlines />
      )}
    </PageLayout>
  );
};

export default AdminToolsPage;
