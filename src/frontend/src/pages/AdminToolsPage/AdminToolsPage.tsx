/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageTitle from '../../layouts/PageTitle/PageTitle';
import AdminToolsUserMangaement from './AdminToolsUserManagement';

const AdminToolsPage = () => {
  return (
    <>
      <PageTitle title={'Admin Tools'} previousPages={[]} />
      <AdminToolsUserMangaement />
    </>
  );
};

export default AdminToolsPage;
