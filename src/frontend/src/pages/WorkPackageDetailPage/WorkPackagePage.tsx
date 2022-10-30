/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { WbsNumber } from 'shared';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import { useAuth } from '../../hooks/auth.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import WorkPackageEditContainer from './WorkPackageEditContainer/WorkPackageEditContainer';
import WorkPackageViewContainer from './WorkPackageViewContainer/WorkPackageViewContainer';
import { useQuery } from '../../hooks/utils.hooks';

interface WorkPackagePageProps {
  wbsNum: WbsNumber;
}

const WorkPackagePage: React.FC<WorkPackagePageProps> = ({ wbsNum }) => {
  const query = useQuery();
  const { isLoading, isError, data, error } = useSingleWorkPackage(wbsNum);
  const [editMode, setEditMode] = useState<boolean>(query.get('edit') === 'true');
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
