/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useHistory, useLocation } from 'react-router-dom';
import { WbsNumber, CreateRefundSourceArgs, ReimbursementReceiptUploadArgs } from 'shared';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm/ReimbursementRequestForm';
import PageLayout from '../../components/PageLayout';
import { useCreateReimbursementRequest, useUploadManyReceipts } from '../../hooks/finance.hooks';
import { routes } from '../../utils/routes';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from './ReimbursementRequestForm/ReimbursementRequestForm';

type CreateRRPrefillState = {
  projectWbsNum: WbsNumber;
  materialId: string;
  materialName: string;
  prefillCost?: number;
};

const CreateReimbursementRequestPage: React.FC = () => {
  const { isLoading: createReimbursementRequestIsLoading, mutateAsync: createReimbursementRequest } =
    useCreateReimbursementRequest();
  const { isLoading: receiptsIsLoading, mutateAsync: uploadReceipts } = useUploadManyReceipts();
  const history = useHistory();

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

  const isSubmitting = createReimbursementRequestIsLoading || receiptsIsLoading;

  // for pre-filling the form when user clicks "Create Reimbursement Request" from a material in the BOM table
  const location = useLocation<CreateRRPrefillState | undefined>();
  const prefill = location.state;

  const defaultValues: ReimbursementRequestFormInput | undefined =
    prefill?.projectWbsNum && prefill?.materialId
      ? {
          vendorId: '',
          dateOfExpense: undefined,
          accountCodeId: '',
          indexCodeId: '',
          secondaryAccount: undefined,
          receiptFiles: [] as ReimbursementReceiptUploadArgs[],
          reimbursementProducts: [
            {
              name: prefill.materialName,
              materialId: prefill.materialId,
              reason: prefill.projectWbsNum,
              cost: prefill.prefillCost ?? 0,
              refundSources: [] as CreateRefundSourceArgs[]
            }
          ]
        }
      : undefined;

  return (
    <PageLayout
      title="Create Reimbursement Request"
      previousPages={[{ name: 'Reimbursement Requests', route: routes.REIMBURSEMENT_REQUESTS }]}
    >
      <ReimbursementRequestForm
        onFormExit={onCancel}
        submitText="Submit"
        submitData={onSubmit}
        isSubmitting={isSubmitting}
        defaultValues={defaultValues}
      />
    </PageLayout>
  );
};

export default CreateReimbursementRequestPage;