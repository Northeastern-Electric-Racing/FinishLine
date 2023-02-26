/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageTitle from '../../layouts/PageTitle/PageTitle';
import AdminToolsProjectManagement from './AdminToolsProjectManagement';
import AdminToolsUserMangaement from './AdminToolsUserManagement';
import AdminToolsWorkPackageMangaement from './AdminToolsWorkPackageManagement';

const AdminToolsPage: React.FC = () => {
  return (
    <>
      <PageTitle title={'Admin Tools'} previousPages={[]} />
      <AdminToolsUserMangaement />
      <AdminToolsWorkPackageMangaement />
      <AdminToolsProjectManagement />
    </>
  );
};

export default AdminToolsPage;
