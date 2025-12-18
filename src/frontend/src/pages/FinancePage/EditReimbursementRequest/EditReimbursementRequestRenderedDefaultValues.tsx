import { OtherProductReason, ReimbursementRequest, WBSElementData } from 'shared';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from '../ReimbursementRequestForm/ReimbursementRequestForm';
import PageLayout from '../../../components/PageLayout';
import { routes } from '../../../utils/routes';
import { centsToDollar, fullNamePipe } from '../../../utils/pipes';
import { isReimbursementRequestLeadershipApproved } from '../../../utils/reimbursement-request.utils';

const EditReimbursementRequestRenderedDefaultValues: React.FC<{
  reimbursementRequest: ReimbursementRequest;
  onSubmitData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
  onExitEditPage: () => void;
  onSubmitToFinance?: (data: ReimbursementRequestDataSubmission) => Promise<void>;
  isSubmitting?: boolean;
}> = ({ reimbursementRequest, onSubmitData, onExitEditPage, onSubmitToFinance, isSubmitting }) => {
  const previousPage = `${routes.REIMBURSEMENT_REQUESTS}/my-requests/${reimbursementRequest.reimbursementRequestId}`;
  const isLeadershipApproved = isReimbursementRequestLeadershipApproved(reimbursementRequest);

  return (
    <PageLayout
      title="Edit Reimbursement Request"
      previousPages={[
        {
          name: 'Reimbursement Requests',
          route: routes.REIMBURSEMENT_REQUESTS
        },
        {
          name: `${fullNamePipe(reimbursementRequest.recipient)}'s Reimbursement Request`,
          route: previousPage
        }
      ]}
    >
      <ReimbursementRequestForm
        submitText="Save"
        submitData={onSubmitData}
        isLeadershipApproved={isLeadershipApproved}
        onSubmitToFinance={onSubmitToFinance}
        isSubmitting={isSubmitting}
        defaultValues={{
          vendorId: reimbursementRequest.vendor.vendorId,
          indexCodeId: reimbursementRequest.indexCode.indexCodeId,
          dateOfExpense: reimbursementRequest.dateOfExpense ? new Date(reimbursementRequest.dateOfExpense) : undefined,
          accountCodeId: reimbursementRequest.accountCode.accountCodeId,
          reimbursementProducts: reimbursementRequest.reimbursementProducts.map((product) => ({
            reason: (product.reimbursementProductReason as WBSElementData).wbsNum
              ? (product.reimbursementProductReason as WBSElementData).wbsNum
              : (product.reimbursementProductReason as OtherProductReason),
            name: product.name,
            refundSources: product.refundSources,
            cost: Number(centsToDollar(product.cost))
          })),
          receiptFiles: reimbursementRequest.receiptPictures.map((receipt) => ({
            name: receipt.name,
            googleFileId: receipt.googleFileId
          }))
        }}
        onFormExit={onExitEditPage}
      />
    </PageLayout>
  );
};

export default EditReimbursementRequestRenderedDefaultValues;
