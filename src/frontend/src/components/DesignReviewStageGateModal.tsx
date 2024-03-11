import { useHistory } from 'react-router-dom';
import { WbsNumber, ChangeRequestType } from 'shared';
import { useCreateStageGateChangeRequest } from '../hooks/change-requests.hooks';
import { useToast } from '../hooks/toasts.hooks';
import StageGateWorkPackageModal from '../pages/WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModal';
import { routes } from '../utils/routes';
import { useCurrentUser } from '../hooks/users.hooks';

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
  const history = useHistory();
  const toast = useToast();
  const { mutateAsync } = useCreateStageGateChangeRequest();
  const user = useCurrentUser();
  const handleConfirm = async ({ confirmDone }: FormInput) => {
    handleClose();
    try {
      await mutateAsync({
        submitterId: user.userId,
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
