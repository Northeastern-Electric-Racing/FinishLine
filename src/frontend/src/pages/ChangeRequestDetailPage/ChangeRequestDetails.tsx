/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useParams } from 'react-router-dom';
import { useSingleChangeRequest } from '../../hooks/change-requests.hooks';
import { useAuth } from '../../hooks/auth.hooks';
import ChangeRequestDetailsView from './ChangeRequestDetailsView';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const ChangeRequestDetails: React.FC = () => {
  interface ParamTypes {
    id: string;
  }
  const { id } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleChangeRequest(parseInt(id));
  const auth = useAuth();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <ChangeRequestDetailsView
      isUserAllowedToReview={
        auth.user?.role !== 'GUEST' && auth.user?.role !== 'MEMBER' && auth.user?.userId !== data?.submitter.userId
      }
      isUserAllowedToImplement={auth.user?.role !== 'GUEST'}
      changeRequest={data!}
    />
  );
};

export default ChangeRequestDetails;
