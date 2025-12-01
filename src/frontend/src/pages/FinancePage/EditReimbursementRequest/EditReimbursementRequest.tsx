/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { ReimbursementRequestDataSubmission } from '../ReimbursementRequestForm/ReimbursementRequestForm';
import {
  useEditReimbursementRequest,
  useLeadershipApproveReimbursementRequest,
  useMarkPendingFinance,
  useSingleReimbursementRequest,
  useUploadManyReceipts
} from '../../../hooks/finance.hooks';
import { useHistory, useParams } from 'react-router-dom';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import EditReimbursementRequestRenderedDefaultValues from './EditReimbursementRequestRenderedDefaultValues';
import { useToast } from '../../../hooks/toasts.hooks';
import { isHead } from 'shared';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { isReimbursementRequestLeadershipApproved } from '../../../utils/reimbursement-request.utils';

const EditReimbursementRequestPage: React.FC<{}> = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const { isLoading: editReimbursementRequestIsLoading } = useEditReimbursementRequest(id);
  const { isLoading: uploadReceiptsIsLoading } = useUploadManyReceipts();
  const { isLoading: getIsLoading, isError, error, data: reimbursementRequest } = useSingleReimbursementRequest(id);
  const { mutateAsync: editReimbursementRequest } = useEditReimbursementRequest(id);
  const { mutateAsync: uploadReceipts } = useUploadManyReceipts();
  const { mutateAsync: markPendingFinance } = useMarkPendingFinance(id);
  const { mutateAsync: leadershipApproveReimbursementRequest } = useLeadershipApproveReimbursementRequest(id);
  const user = useCurrentUser();
  const toast = useToast();

  if (isError) return <ErrorPage error={error} />;

  if (getIsLoading || editReimbursementRequestIsLoading || uploadReceiptsIsLoading || !reimbursementRequest)
    return <LoadingIndicator />;

  const onCancel = () => {
    history.goBack();
  };

  const onSubmitEditData = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const filesToKeep = data.receiptFiles.filter((file) => file.googleFileId !== '');
    try {
      await editReimbursementRequest({ ...data, receiptPictures: filesToKeep, indexCodeId: data.indexCodeId! });
      await uploadReceipts({
        id: reimbursementRequest.reimbursementRequestId,
        files: data.receiptFiles.filter((receipt) => receipt.googleFileId === '').map((file) => file.file!)
      });
      toast.success('Reimbursement request updated successfully.');
      history.goBack();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update reimbursement request: ${error.message}`);
      }
    }

    return reimbursementRequest.reimbursementRequestId;
  };

  const onSubmitToFinance = async (data: ReimbursementRequestDataSubmission) => {
    const filesToKeep = data.receiptFiles.filter((file) => file.googleFileId !== '');
    try {
      await editReimbursementRequest({ ...data, receiptPictures: filesToKeep, indexCodeId: data.indexCodeId! });
      await uploadReceipts({
        id: reimbursementRequest.reimbursementRequestId,
        files: data.receiptFiles.filter((receipt) => receipt.googleFileId === '').map((file) => file.file!)
      });

      if (isHead(user.role) && !isReimbursementRequestLeadershipApproved(reimbursementRequest)) {
        await leadershipApproveReimbursementRequest();
      }

      await markPendingFinance();
      toast.success('Reimbursement request submitted to Finance.');
      history.goBack();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to submit reimbursement request to Finance: ${error.message}`);
      }
    }
  };

  return (
    <EditReimbursementRequestRenderedDefaultValues
      reimbursementRequest={reimbursementRequest}
      onSubmitData={onSubmitEditData}
      onExitEditPage={onCancel}
      onSubmitToFinance={onSubmitToFinance}
    />
  );
};

export default EditReimbursementRequestPage;
