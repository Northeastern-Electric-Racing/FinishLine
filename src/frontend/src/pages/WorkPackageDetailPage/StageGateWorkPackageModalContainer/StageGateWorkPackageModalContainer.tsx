/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import confetti from 'canvas-confetti';
import { useHistory } from 'react-router-dom';
import { ChangeRequestType, WbsNumber, wbsPipe } from 'shared';
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
  hideStatus?: boolean;
}

export interface FormInput {
  confirmDone: boolean;
  dateCompleted: Date;
}

const StageGateWorkPackageModalContainer: React.FC<StageGateWorkPackageModalContainerProps> = ({
  wbsNum,
  modalShow,
  handleClose,
  hideStatus = false
}) => {
  const auth = useAuth();
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateStageGateChangeRequest();

  const handleConfirm = async ({ confirmDone, dateCompleted }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot create stage gate change request without being logged in');
    try {
      await mutateAsync({
        submitterId: auth.user?.userId,
        wbsNum,
        type: ChangeRequestType.StageGate,
        confirmDone,
        dateCompleted
      });
      [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].forEach((xPos) => {
        confetti({
          origin: { y: -0.5, x: xPos },
          angle: 270,
          gravity: 1.5,
          startVelocity: 35,
          spread: 70,
          particleCount: 50
        });
      });
      history.push(`${routes.PROJECTS}/${wbsPipe(wbsNum)}/change-requests`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (!hideStatus) {
    if (isLoading) return <LoadingIndicator />;
    if (isError) return <ErrorPage message={error?.message} />;
  }

  return <StageGateWorkPackageModal wbsNum={wbsNum} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default StageGateWorkPackageModalContainer;
