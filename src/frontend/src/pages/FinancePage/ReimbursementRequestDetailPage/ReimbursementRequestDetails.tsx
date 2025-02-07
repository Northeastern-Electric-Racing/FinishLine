/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useSingleReimbursementRequest } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useParams } from 'react-router-dom';
import ReimbursementRequestDetailsView from './ReimbursementRequestDetailsView';
import ErrorPage from '../../ErrorPage';

const ReimbursementRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: reimbursementRequest, isError, error, isLoading } = useSingleReimbursementRequest(id);

  if (isError) return <ErrorPage error={error} />;
  if (!reimbursementRequest || isLoading) return <LoadingIndicator />;

  return <ReimbursementRequestDetailsView reimbursementRequest={reimbursementRequest} />;
};

export default ReimbursementRequestDetails;
