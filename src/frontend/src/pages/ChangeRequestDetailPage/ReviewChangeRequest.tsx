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
  const crId = id;
  const auth = useAuth();
  const { isLoading, isError, error, mutateAsync } = useReviewChangeRequest();
  const toast = useToast();

  const handleConfirm = async ({ reviewNotes, accepted, psId }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot review change request without being logged in');

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

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <ReviewChangeRequestsView cr={cr} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default ReviewChangeRequest;
