/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { WbsNumber } from 'shared';
import { useSingleProject } from '../../hooks/projects.hooks';
import ProjectViewContainer from './ProjectViewContainer/ProjectViewContainer';
import ProjectEditContainer from './ProjectForm/ProjectEditContainer';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useQuery } from '../../hooks/utils.hooks';
import { useHistory } from 'react-router-dom';

interface ProjectPageProps {
  wbsNum: WbsNumber;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ wbsNum }) => {
  const history = useHistory();
  const query = useQuery();
  const [editMode, setEditMode] = useState<boolean>(query.get('edit') === 'true');
  const {
    isLoading: projectIsLoading,
    isError: projectIsError,
    data: project,
    error: projectError
  } = useSingleProject(wbsNum);

  if (projectIsError) return <ErrorPage message={projectError.message} />;

  if (projectIsLoading || !project) return <LoadingIndicator />;

  if (editMode) {
    return (
      <ProjectEditContainer
        project={project}
        exitEditMode={(pathToRedirectTo?: string) => {
          setEditMode(false);
          history.push(pathToRedirectTo ?? history.location.pathname);
        }}
      />
    );
  }
  return <ProjectViewContainer project={project} enterEditMode={() => setEditMode(true)} />;
};

export default ProjectPage;
