import { OtherProductReason, ReimbursementRequest, WBSElementData } from 'shared';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from '../ReimbursementRequestForm/ReimbursementRequestForm';
import PageLayout from '../../../components/PageLayout';
import { routes } from '../../../utils/routes';
import { centsToDollar, fullNamePipe } from '../../../utils/pipes';

const EditReimbursementRequestRenderedDefaultValues: React.FC<{
  reimbursementRequest: ReimbursementRequest;
  onSubmitData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
}> = ({ reimbursementRequest, onSubmitData }) => {
  const previousPage = `${routes.REIMBURSEMENT_REQUESTS}/${reimbursementRequest.reimbursementRequestId}`;

  return (
    <PageLayout
      title="Edit Reimbursement Request"
      previousPages={[
        {
          name: 'Finance',
          route: routes.FINANCE
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
        defaultValues={{
          vendorId: reimbursementRequest.vendor.vendorId,
          account: reimbursementRequest.account,
          dateOfExpense: new Date(reimbursementRequest.dateOfExpense),
          accountCodeId: reimbursementRequest.accountCode.accountCodeId,
          reimbursementProducts: reimbursementRequest.reimbursementProducts.map((product) => ({
            reason: (product.reimbursementProductReason as WBSElementData).wbsNum
              ? (product.reimbursementProductReason as WBSElementData).wbsNum
              : (product.reimbursementProductReason as OtherProductReason),
            name: product.name,
            cost: Number(centsToDollar(product.cost))
          })),
          receiptFiles: reimbursementRequest.receiptPictures.map((receipt) => ({
            name: receipt.name,
            googleFileId: receipt.googleFileId
          }))
        }}
        previousPage={previousPage}
      />
    </PageLayout>
  );
};

export default EditReimbursementRequestRenderedDefaultValues;
