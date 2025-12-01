/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageLayout from '../../components/PageLayout';
import { useCreateReimbursementRequest, useUploadManyReceipts } from '../../hooks/finance.hooks';
import { routes } from '../../utils/routes';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from './ReimbursementRequestForm/ReimbursementRequestForm';

const CreateReimbursementRequestPage: React.FC = () => {
  const { isLoading: createReimbursementRequestIsLoading, mutateAsync: createReimbursementRequest } =
    useCreateReimbursementRequest();
  const { isLoading: receiptsIsLoading, mutateAsync: uploadReceipts } = useUploadManyReceipts();
  const history = useHistory();

  if (createReimbursementRequestIsLoading || receiptsIsLoading) return <LoadingIndicator />;

  const onSubmit = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const { reimbursementRequestId } = await createReimbursementRequest({ ...data, indexCodeId: data.indexCodeId! });
    await uploadReceipts({
      id: reimbursementRequestId,
      files: data.receiptFiles.map((file) => file.file!)
    });
    return reimbursementRequestId;
  };

  const onCancel = () => {
    history.goBack();
  };

  return (
    <PageLayout
      title="Create Reimbursement Request"
      previousPages={[{ name: 'Reimbursement Requests', route: routes.REIMBURSEMENT_REQUESTS }]}
    >
      <ReimbursementRequestForm onFormExit={onCancel} submitText="Submit" submitData={onSubmit} />
    </PageLayout>
  );
};

export default CreateReimbursementRequestPage;
