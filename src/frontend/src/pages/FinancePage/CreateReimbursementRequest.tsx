/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import LoadingIndicator from '../../components/LoadingIndicator';
import { useCreateReimbursementRequest, useUploadManyReceipts } from '../../hooks/finance.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { routes } from '../../utils/routes';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from './ReimbursementRequestForm/ReimbursementRequestForm';

const CreateReimbursementRequestPage: React.FC = () => {
  const { isLoading: createReimbursementRequestIsLoading, mutateAsync: createReimbursementRequest } =
    useCreateReimbursementRequest();
  const { isLoading: receiptsIsLoading, mutateAsync: uploadReceipts } = useUploadManyReceipts();

  if (createReimbursementRequestIsLoading || receiptsIsLoading) return <LoadingIndicator />;

  const onSubmit = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const { reimbursementRequestId } = await createReimbursementRequest(data);
    await uploadReceipts({
      id: reimbursementRequestId,
      files: data.receiptFiles.map((file) => file.file)
    });
    return reimbursementRequestId;
  };

  return (
    <>
      <PageTitle
        title="Create Reimbursement Request"
        previousPages={[{ name: 'Reimbursement Requests', route: routes.FINANCE }]}
      />
      <ReimbursementRequestForm submitText="Submit" submitData={onSubmit} previousPage={routes.FINANCE} />;
    </>
  );
};

export default CreateReimbursementRequestPage;
