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

const EditReimbursementRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { isLoading: editReimbursementRequestIsLoading, mutateAsync: editReimbursementRequest } =
    useEditReimbursementRequest(id);
  const { isLoading: uploadReceiptsIsLoading, mutateAsync: uploadReceipts } = useUploadManyReceipts();
  const { isLoading: getIsLoading, isError, error, data: reimbursementRequest } = useSingleReimbursementRequest(id);

  if (isError) return <ErrorPage error={error} />;

  if (getIsLoading || editReimbursementRequestIsLoading || uploadReceiptsIsLoading || !reimbursementRequest)
    return <LoadingIndicator />;

  const onSubmit = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const filesToKeep = data.receiptFiles.filter((file) => file.googleFileId !== '');

    await editReimbursementRequest({ ...data, receiptPictures: filesToKeep, account: data.account! });
    await uploadReceipts({
      id: reimbursementRequest.reimbursementRequestId,
      files: data.receiptFiles.filter((receipt) => receipt.googleFileId === '').map((file) => file.file!)
    });

    return reimbursementRequest.reimbursementRequestId;
  };

  return (
    <EditReimbursementRequestRenderedDefaultValues reimbursementRequest={reimbursementRequest} onSubmitData={onSubmit} />
  );
};

export default EditReimbursementRequestPage;
