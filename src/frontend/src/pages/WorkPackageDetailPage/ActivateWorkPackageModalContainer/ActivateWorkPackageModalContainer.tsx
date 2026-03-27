/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { ChangeRequestType, dateToMidnightUTC, WbsNumber, wbsPipe } from 'shared';
import { useAuth } from '../../../hooks/auth.hooks';
import { useCreateActivationChangeRequest } from '../../../hooks/change-requests.hooks';
import { useAllMembers } from '../../../hooks/users.hooks';
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
  leadId?: string;
  managerId?: string;
  startDate: Date;
  confirmDetails: boolean;
}

const ActivateWorkPackageModalContainer: React.FC<ActivateWorkPackageModalContainerProps> = ({
  wbsNum,
  modalShow,
  handleClose
}) => {
  const auth = useAuth();
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllMembers();
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useCreateActivationChangeRequest();

  const handleConfirm = async ({ leadId, managerId, startDate, confirmDetails }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot create activation change request without being logged in');
    if (!leadId) {
      throw new Error('Project Lead Id must be defined to create an activation change request');
    }
    if (!managerId) {
      throw new Error('Project Manager Id must be defined to create an activation change request');
    }
    try {
      await mutateAsync({
        submitterId: auth.user?.userId,
        wbsNum,
        type: ChangeRequestType.Activation,
        leadId,
        managerId,
        startDate: dateToMidnightUTC(startDate).toISOString(),
        confirmDetails
      });
      history.push(`${routes.PROJECTS}/${wbsPipe(wbsNum)}/change-requests`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (isLoading || usersIsLoading || !users) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  if (usersIsError) return <ErrorPage message={usersError?.message} />;

  return (
    <ActivateWorkPackageModal
      wbsNum={wbsNum}
      modalShow={modalShow}
      onHide={handleClose}
      onSubmit={handleConfirm}
      allUsers={users}
    />
  );
};

export default ActivateWorkPackageModalContainer;
