/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useParams } from 'react-router-dom';
import { useSingleChangeRequest } from '../../services/change-requests.hooks';
import { useAuth } from '../../services/auth.hooks';
import ChangeRequestDetailsView from './change-request-details/change-request-details';
import LoadingIndicator from '../../components/loading-indicator/loading-indicator';
import ErrorPage from '../../pages/ErrorPage/error-page';

const ChangeRequestDetails: React.FC = () => {
  interface ParamTypes {
    id: string;
  }
  const { id } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleChangeRequest(parseInt(id!));
  const auth = useAuth();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <ChangeRequestDetailsView
      isUserAllowedToReview={
        auth.user?.role !== 'GUEST' &&
        auth.user?.role !== 'MEMBER' &&
        auth.user?.userId !== data?.submitter.userId
      }
      isUserAllowedToImplement={auth.user?.role !== 'GUEST'}
      changeRequest={data!}
    />
  );
};

export default ChangeRequestDetails;
