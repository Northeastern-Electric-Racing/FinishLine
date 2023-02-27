/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { validateWBS, WbsNumber, wbsPipe } from 'shared';
import { useHistory } from 'react-router-dom';
import { useToast } from '../../../hooks/toasts.hooks';
import { useDeleteWorkPackage } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import DeleteWorkPackageView from './DeleteWorkPackageView';

interface DeleteWorkPackageRequestProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  handleClose: () => void;
}

export interface DeleteWorkPackageInputs {
  wbsNum: string;
}

const DeleteWorkPackage: React.FC<DeleteWorkPackageRequestProps> = ({
  wbsNum,
  modalShow,
  handleClose
}: DeleteWorkPackageRequestProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteWorkPackage();

  const handleConfirm = async ({ wbsNum }: DeleteWorkPackageInputs) => {
    handleClose();
    const wbsNumber = validateWBS(wbsNum);
    await mutateAsync(wbsNumber).catch((error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    });
    history.goBack();
    toast.success(`Work Package #${wbsPipe(wbsNumber)} Deleted Successfully!`);
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <DeleteWorkPackageView workPackage={wbsNum} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default DeleteWorkPackage;
