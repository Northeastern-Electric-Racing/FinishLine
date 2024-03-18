/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { ChangeRequestType, isGuest, WbsNumber } from 'shared';
import { useAuth } from '../../../hooks/auth.hooks';
import { useCreateActivationChangeRequest } from '../../../hooks/change-requests.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import { routes } from '../../../utils/routes';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ActivateWorkPackageModal from './ActivateWorkPackageModal';
import { useToast } from '../../../hooks/toasts.hooks';

interface ActivateWorkPackageModalContainerProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  handleClose: () => void;
}

export interface FormInput {
  projectLeadId?: number;
  projectManagerId?: number;
  startDate: Date;
  confirmDetails: boolean;
}

const ActivateWorkPackageModalContainer: React.FC<ActivateWorkPackageModalContainerProps> = ({
  wbsNum,
  modalShow,
  handleClose
}) => {
  const auth = useAuth();
  const users = useAllUsers();
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateActivationChangeRequest();

  const handleConfirm = async ({ projectLeadId, projectManagerId, startDate, confirmDetails }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot create activation change request without being logged in');
    if (!projectLeadId) {
      throw new Error('Project Lead Id must be defined to create an activation change request');
    }
    if (!projectManagerId) {
      throw new Error('Project Manager Id must be defined to create an activation change request');
    }
    try {
      await mutateAsync({
        submitterId: auth.user?.userId,
        wbsNum,
        type: ChangeRequestType.Activation,
        projectLeadId,
        projectManagerId,
        startDate: startDate.toISOString(),
        confirmDetails
      });
      history.push(routes.CHANGE_REQUESTS);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (isLoading || users.isLoading) return <LoadingIndicator />;

  if (isError || users.isError) return <ErrorPage message={error?.message} />;

  return (
    <ActivateWorkPackageModal
      wbsNum={wbsNum}
      modalShow={modalShow}
      onHide={handleClose}
      onSubmit={handleConfirm}
      allUsers={users.data!.filter((u) => !isGuest(u.role))}
    />
  );
};

export default ActivateWorkPackageModalContainer;
