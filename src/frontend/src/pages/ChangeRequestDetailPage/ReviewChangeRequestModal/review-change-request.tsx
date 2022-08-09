/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useParams } from 'react-router-dom';
import { useAuth } from '../../../services/auth.hooks';
import { useReviewChangeRequest } from '../../../services/change-requests.hooks';
import ErrorPage from '../../../pages/ErrorPage/error-page';
import LoadingIndicator from '../../../components/loading-indicator/loading-indicator';
import ReviewChangeRequestsView from './review-change-request/review-change-request';

interface ReviewChangeRequestProps {
  modalShow: boolean;
  handleClose: () => void;
}

export interface FormInput {
  reviewNotes: string;
  accepted: boolean;
}

const ReviewChangeRequest: React.FC<ReviewChangeRequestProps> = ({
  modalShow,
  handleClose
}: ReviewChangeRequestProps) => {
  interface ParamTypes {
    id: string;
  }
  const { id } = useParams<ParamTypes>();
  const crId = parseInt(id!);
  const auth = useAuth();
  const { isLoading, isError, error, mutateAsync } = useReviewChangeRequest();

  const handleConfirm = async ({ reviewNotes, accepted }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined)
      throw new Error('Cannot review change request without being logged in');
    await mutateAsync({
      reviewerId: auth.user?.userId,
      crId,
      reviewNotes,
      accepted
    });
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <ReviewChangeRequestsView
      crId={crId}
      modalShow={modalShow}
      onHide={handleClose}
      onSubmit={handleConfirm}
    />
  );
};

export default ReviewChangeRequest;
