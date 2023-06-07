/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageTitle from '../../layouts/PageTitle/PageTitle';
import AdminToolsUserManagement from './AdminToolsUserManagement';
import AdminToolsSlackUpcomingDeadlines from './AdminToolsSlackUpcomingDeadlines';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin } from 'shared';

const AdminToolsPage: React.FC = () => {
  const currentUser = useCurrentUser();

  return (
    <>
      <PageTitle title="Admin Tools" previousPages={[]} />
      <AdminToolsUserManagement />
      {isAdmin(currentUser.role) ? <AdminToolsSlackUpcomingDeadlines /> : null};
    </>
  );
};

export default AdminToolsPage;
