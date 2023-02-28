/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { validateWBS, WbsNumber, wbsPipe } from 'shared';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useToast } from '../../hooks/toasts.hooks';
import DeleteProjectView from './DeleteProjectView';
import { useDeleteProject } from '../../hooks/projects.hooks';

interface DeleteProjectProps {
  modalShow: boolean;
  handleClose: () => void;
  wbsNum: WbsNumber;
}

export interface DeleteProjectInputs {
  wbsNum: string;
}

const DeleteProject: React.FC<DeleteProjectProps> = ({ modalShow, handleClose, wbsNum }: DeleteProjectProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteProject();

  const handleConfirm = async ({ wbsNum }: DeleteProjectInputs) => {
    handleClose();
    const wbsNumber = validateWBS(wbsNum);
    await mutateAsync(wbsNumber).catch((error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    });
    history.goBack();
    toast.success(`Project #${wbsPipe(wbsNumber)} Deleted Successfully!`);
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <DeleteProjectView project={wbsNum} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default DeleteProject;
