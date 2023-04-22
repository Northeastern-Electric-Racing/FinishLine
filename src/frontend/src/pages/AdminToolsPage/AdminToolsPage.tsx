/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageTitle from '../../layouts/PageTitle/PageTitle';
import AdminToolsUserManagement from './AdminToolsUserManagement';
import AdminToolsSlackUpcomingDeadlines from './AdminToolsSlackUpcomingDeadlines';

const AdminToolsPage: React.FC = () => {
  return (
    <>
      <PageTitle title="Admin Tools" previousPages={[]} />
      <AdminToolsUserManagement />
      <AdminToolsSlackUpcomingDeadlines />
    </>
  );
};

export default AdminToolsPage;
