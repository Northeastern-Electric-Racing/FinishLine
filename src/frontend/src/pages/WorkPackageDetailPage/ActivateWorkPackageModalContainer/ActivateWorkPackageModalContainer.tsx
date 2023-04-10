/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { ChangeRequestType, WbsNumber } from 'shared';
import { useAuth } from '../../../hooks/auth.hooks';
import { useCreateActivationChangeRequest } from '../../../hooks/change-requests.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import { routes } from '../../../utils/routes';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ActivateWorkPackageModal from './ActivateWorkPackageModal';

interface ActivateWorkPackageModalContainerProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  handleClose: () => void;
}

export interface FormInput {
  projectLeadId?: {label: string, id: string};
  projectManagerId?: {label: string, id: string};
  startDate: string;
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
  const { isLoading, isError, error, mutateAsync } = useCreateActivationChangeRequest();

  const handleConfirm = async ({ projectLeadId, projectManagerId, startDate, confirmDetails }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot create activation change request without being logged in');
    const { id } = projectLeadId!;
    const { id: id2 } = projectManagerId!;
    await mutateAsync({
      submitterId: auth.user?.userId,
      wbsNum,
      type: ChangeRequestType.Activation,
      id,
      id2,
      startDate,
      confirmDetails
    });
    history.push(routes.CHANGE_REQUESTS);
  };

  if (isLoading || users.isLoading) return <LoadingIndicator />;

  if (isError || users.isError) return <ErrorPage message={error?.message} />;

  return (
    <ActivateWorkPackageModal
      wbsNum={wbsNum}
      modalShow={modalShow}
      onHide={handleClose}
      onSubmit={handleConfirm}
      allUsers={users.data!.filter((u) => u.role !== 'GUEST')}
    />
  );
};

export default ActivateWorkPackageModalContainer;
