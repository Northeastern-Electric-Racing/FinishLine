/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { validateWBS, WbsElement, WbsNumber, wbsPipe } from 'shared';
import { useHistory } from 'react-router-dom';
import { useToast } from '../../hooks/toasts.hooks';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';
import { useDeleteWorkPackage } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import CreateStandardChangeRequestFromEditView from './CreateStandardChangeRequestFromEditView';

interface CreateStandardCrProps {
  wbsElement: WbsElement;
  modalShow: boolean;
  handleClose: () => void;
}

const CreateStandardChangeRequest: React.FC<CreateStandardCrProps> = ({
  wbsElement,
  modalShow,
  handleClose
}: CreateStandardCrProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteWorkPackage();

  const handleConfirm = async ({ wbsNum, type, what, why }: CreateStandardChangeRequestPayload) => {
    try {
      // await mutateAsync(wbsNumber);
      handleClose();
      history.goBack();
      // toast.success(`Work Package #${wbsPipe(wbsNumber)} Deleted Successfully!`);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <CreateStandardChangeRequestFromEditView modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default CreateStandardChangeRequest;
