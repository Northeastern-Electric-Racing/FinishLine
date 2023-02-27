
/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project } from 'shared';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useToast } from '../../hooks/toasts.hooks';
import DeleteProjectView from './DeleteProjectView';
import { useDeleteProject } from '../../hooks/projects.hooks';

interface DeleteProjectProps {
  modalShow: boolean;
  handleClose: () => void;
  project: Project;
}

export interface DeleteProjectInputs {
  projectId: string;
}

const DeleteProject: React.FC<DeleteProjectProps> = ({
  modalShow,
  handleClose,
  project
}: DeleteProjectProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteProject();

  const handleConfirm = async ({ projectId }: DeleteProjectInputs) => {
    handleClose();
    const numProjectId = parseInt(projectId);
    await mutateAsync(numProjectId).catch((error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    });
    history.goBack();
    toast.success(`Project #${projectId} Deleted Successfully!`);
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <DeleteProjectView project={project} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default DeleteProject;

