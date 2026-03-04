import { ProjectProposedChanges } from 'shared';
import DiffSectionEdit from './DiffSectionEdit';
import { ComparableCollection, getChangesForProject } from '../../../utils/diff-page.utils';
import { useEffect, useState } from 'react';

const NewProjectDiffSection = ({ projectProposedChanges }: { projectProposedChanges: ProjectProposedChanges }) => {
  const [collections, setCollections] = useState<ComparableCollection[]>([]);

  useEffect(() => {
    setCollections(getChangesForProject(projectProposedChanges, undefined));
  }, [projectProposedChanges, setCollections]);

  return <DiffSectionEdit collections={collections} />;
};

export default NewProjectDiffSection;
