/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { ReimbursementRequestDataSubmission } from '../ReimbursementRequestForm/ReimbursementRequestForm';
import {
  useEditReimbursementRequest,
  useSingleReimbursementRequest,
  useUploadManyReceipts
} from '../../../hooks/finance.hooks';
import { useParams } from 'react-router-dom';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import EditReimbursementRequestRenderedDefaultValues from './EditReimbursementRequestRenderedDefaultValues';

const EditReimbursementRequestPage: React.FC<{
  onSubmitEditData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
  onExitEditPage: () => void;
  onSubmitToFinance?: (data: ReimbursementRequestDataSubmission) => Promise<void>;
}> = ({ onSubmitEditData, onExitEditPage, onSubmitToFinance }) => {
  const { id } = useParams<{ id: string }>();

  const { isLoading: editReimbursementRequestIsLoading } = useEditReimbursementRequest(id);
  const { isLoading: uploadReceiptsIsLoading } = useUploadManyReceipts();
  const { isLoading: getIsLoading, isError, error, data: reimbursementRequest } = useSingleReimbursementRequest(id);

  if (isError) return <ErrorPage error={error} />;

  if (getIsLoading || editReimbursementRequestIsLoading || uploadReceiptsIsLoading || !reimbursementRequest)
    return <LoadingIndicator />;

  return (
    <EditReimbursementRequestRenderedDefaultValues
      reimbursementRequest={reimbursementRequest}
      onSubmitData={onSubmitEditData}
      onExitEditPage={onExitEditPage}
      onSubmitToFinance={onSubmitToFinance}
    />
  );
};

export default EditReimbursementRequestPage;
