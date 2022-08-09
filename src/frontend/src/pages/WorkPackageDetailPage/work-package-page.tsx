/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { WbsNumber } from 'shared';
import { useSingleWorkPackage } from '../../services/work-packages.hooks';
import { useAuth } from '../../services/auth.hooks';
import LoadingIndicator from '../../components/loading-indicator/loading-indicator';
import ErrorPage from '../../pages/ErrorPage/error-page';
import WorkPackageEditContainer from './work-package-edit-container/work-package-edit-container';
import WorkPackageViewContainer from './work-package-view-container/work-package-view-container';

interface WorkPackagePageProps {
  wbsNum: WbsNumber;
}

const WorkPackagePage: React.FC<WorkPackagePageProps> = ({ wbsNum }) => {
  const { isLoading, isError, data, error } = useSingleWorkPackage(wbsNum);
  const [editMode, setEditMode] = useState<boolean>(false);
  const auth = useAuth();
  const isGuest = auth.user?.role === 'GUEST';

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  if (editMode) {
    return <WorkPackageEditContainer workPackage={data!} exitEditMode={() => setEditMode(false)} />;
  }

  return (
    <WorkPackageViewContainer
      workPackage={data!}
      enterEditMode={() => setEditMode(true)}
      allowEdit={!isGuest}
      allowActivate={!isGuest}
      allowStageGate={!isGuest}
      allowRequestChange={!isGuest}
    />
  );
};

export default WorkPackagePage;
