import { WbsNumber, WorkPackageProposedChanges } from 'shared';
import { useSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import DiffSectionEdit from './DiffSectionEdit';
import { ComparableCollection, getChangesForWorkPackage } from '../../../utils/diff-page.utils';
import { useEffect, useState } from 'react';

const WorkPackageDiffSection = ({
  wbsNum,
  workPackageProposedChanges
}: {
  wbsNum: WbsNumber;
  workPackageProposedChanges: WorkPackageProposedChanges;
}) => {
  const { data: originalWorkPackage, isLoading, isError, error } = useSingleWorkPackage(wbsNum);
  const [collections, setCollections] = useState<ComparableCollection[]>([]);

  useEffect(() => {
    if (originalWorkPackage) {
      setCollections([getChangesForWorkPackage(originalWorkPackage, workPackageProposedChanges)]);
    }
  }, [originalWorkPackage, workPackageProposedChanges, setCollections]);

  if (isError) return <ErrorPage error={error} />;
  if (isLoading || !originalWorkPackage) return <LoadingIndicator />;

  return <DiffSectionEdit collections={collections} />;
};

export default WorkPackageDiffSection;
