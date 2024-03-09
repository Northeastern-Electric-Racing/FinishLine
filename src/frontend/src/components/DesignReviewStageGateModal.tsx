import { useHistory } from 'react-router-dom';
import { WbsNumber, ChangeRequestType } from 'shared';
import { useAuth } from '../hooks/auth.hooks';
import { useCreateStageGateChangeRequest } from '../hooks/change-requests.hooks';
import { useToast } from '../hooks/toasts.hooks';
import StageGateWorkPackageModal from '../pages/WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModal';
import { routes } from '../utils/routes';

interface StageGateModalProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  handleClose: () => void;
}

interface FormInput {
  confirmDone: boolean;
}

// stage gate modal component (redacted loading and error for this specific case)
export const StageGateModal: React.FC<StageGateModalProps> = ({ wbsNum, modalShow, handleClose }) => {
  const auth = useAuth();
  const history = useHistory();
  const toast = useToast();
  const { mutateAsync } = useCreateStageGateChangeRequest();

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

  return <StageGateWorkPackageModal wbsNum={wbsNum} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};
