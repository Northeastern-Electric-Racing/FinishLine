import { ProjectProposedChanges, WbsNumber } from 'shared';
import { useSingleProject } from '../../../hooks/projects.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import DiffSectionEdit from './DiffSectionEdit';
import { ComparableCollection, getChangesForProject } from '../../../utils/diff-page.utils';
import { useEffect, useState } from 'react';

const ProjectDiffSection = ({
  projectProposedChanges,
  wbsNum
}: {
  projectProposedChanges: ProjectProposedChanges;
  wbsNum: WbsNumber;
}) => {
  const { data: originalProject, isLoading, isError, error } = useSingleProject(wbsNum);
  const [collections, setCollections] = useState<ComparableCollection[]>([]);

  useEffect(() => {
    if (originalProject) {
      setCollections(getChangesForProject(originalProject, projectProposedChanges));
    }
  }, [originalProject, projectProposedChanges, setCollections]);

  if (isError) return <ErrorPage error={error} />;
  if (isLoading || !originalProject) return <LoadingIndicator />;

  return <DiffSectionEdit collections={collections} />;
};

export default ProjectDiffSection;
