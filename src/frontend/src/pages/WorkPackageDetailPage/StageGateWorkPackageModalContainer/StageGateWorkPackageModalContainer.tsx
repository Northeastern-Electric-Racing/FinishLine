/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { ChangeRequestType, WbsNumber } from 'shared';
import { useAuth } from '../../../hooks/auth.hooks';
import { useCreateStageGateChangeRequest } from '../../../hooks/change-requests.hooks';
import { routes } from '../../../utils/routes';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import StageGateWorkPackageModal from './StageGateWorkPackageModal';
import { useToast } from '../../../hooks/toasts.hooks';

interface StageGateWorkPackageModalContainerProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  handleClose: () => void;
}

export interface FormInput {
  confirmDone: boolean;
}

const StageGateWorkPackageModalContainer: React.FC<StageGateWorkPackageModalContainerProps> = ({
  wbsNum,
  modalShow,
  handleClose
}) => {
  const auth = useAuth();
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateStageGateChangeRequest();

  const handleConfirm = async ({ confirmDone }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot create stage gate change request without being logged in');
    try {
      await mutateAsync({
        submitterId: auth.user?.userId,
        wbsNum,
        type: ChangeRequestType.StageGate,
        confirmDone
      });
      history.push(routes.CHANGE_REQUESTS);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <StageGateWorkPackageModal wbsNum={wbsNum} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default StageGateWorkPackageModalContainer;
