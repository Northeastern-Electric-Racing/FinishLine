/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hooks';
import { useReviewChangeRequest } from '../../hooks/change-requests.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import ReviewChangeRequestsView from './ReviewChangeRequestView';
import { ChangeRequest } from 'shared';
import { useToast } from '../../hooks/toasts.hooks';
import ChangeRequestBlockerWarning from '../../components/ChangeRequestBlockerWarning';
import { useGetBlockingWorkPackages } from '../../hooks/work-packages.hooks';

interface ReviewChangeRequestProps {
  modalShow: boolean;
  handleClose: () => void;
  cr: ChangeRequest;
}

export interface FormInput {
  reviewNotes: string;
  accepted: boolean;
  psId: string;
}

const ReviewChangeRequest: React.FC<ReviewChangeRequestProps> = ({
  modalShow,
  handleClose,
  cr
}: ReviewChangeRequestProps) => {
  interface ParamTypes {
    id: string;
  }
  const { id } = useParams<ParamTypes>();
  const crId = parseInt(id);
  const auth = useAuth();
  const { isLoading, isError, error, mutateAsync } = useReviewChangeRequest();
  const toast = useToast();
  const { isLoading: blockingLoading, isError: blockingIsError, error: blockingError, data } = useGetBlockingWorkPackages(cr.wbsNum);

  const handleConfirm = async ({ reviewNotes, accepted, psId }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot review change request without being logged in');

    if (accepted) {

    }
    await mutateAsync({
      reviewerId: auth.user?.userId,
      crId,
      reviewNotes,
      accepted,
      psId
    }).catch((error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    });
  };

  if (isLoading || blockingLoading || !data) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  if (blockingIsError) return <ErrorPage message={blockingError?.message} />;

  return <ChangeRequestBlockerWarning changeRequest={cr} workPackages={data} modalShow={modalShow} onHide={handleClose} />;
};

export default ReviewChangeRequest;
