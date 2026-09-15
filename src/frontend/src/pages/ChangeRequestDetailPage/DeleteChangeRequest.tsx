/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest } from 'shared';
import DeleteChangeRequestView from './DeleteChangeRequestView';
import { useHistory } from 'react-router-dom';
import { useDeleteChangeRequest } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useToast } from '../../hooks/toasts.hooks';

interface DeleteChangeRequestProps {
  modalShow: boolean;
  handleClose: () => void;
  cr: ChangeRequest;
}

export interface DeleteChangeRequestInputs {
  crId: string;
}

const DeleteChangeRequest: React.FC<DeleteChangeRequestProps> = ({
  modalShow,
  handleClose,
  cr
}: DeleteChangeRequestProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteChangeRequest();

  const handleConfirm = async () => {
    handleClose();
    await mutateAsync(cr.crId).catch((error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    });
    history.goBack();
    toast.success(`Change Request #${cr.identifier} Deleted Successfully!`);
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <DeleteChangeRequestView changeRequest={cr} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default DeleteChangeRequest;
