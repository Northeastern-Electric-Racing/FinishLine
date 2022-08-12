/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { WbsNumber } from 'shared';
import { useSingleProject } from '../../hooks/projects.hooks';
import ProjectViewContainer from './ProjectViewContainer/ProjectViewContainer';
import ProjectEditContainer from './ProjectEditContainer/ProjectEditContainer';
import LoadingIndicator from '../../components/loading-indicator';
import ErrorPage from '../ErrorPage';

interface ProjectPageProps {
  wbsNum: WbsNumber;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ wbsNum }) => {
  const { isLoading, isError, data, error } = useSingleProject(wbsNum);
  const [editMode, setEditMode] = useState<boolean>(false);

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  if (editMode) {
    return <ProjectEditContainer proj={data!} exitEditMode={() => setEditMode(false)} />;
  }
  return <ProjectViewContainer proj={data!} enterEditMode={() => setEditMode(true)} />;
};

export default ProjectPage;
