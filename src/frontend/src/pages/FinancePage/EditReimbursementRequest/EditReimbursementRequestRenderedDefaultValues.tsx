import { ReimbursementRequest } from 'shared';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from '../ReimbursementRequestForm/ReimbursementRequestForm';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useDownloadImages } from '../../../hooks/finance.hooks';
import PageLayout from '../../../components/PageLayout';
import { routes } from '../../../utils/routes';
import { fullNamePipe } from '../../../utils/pipes';

const EditReimbursementRequestRenderedDefaultValues: React.FC<{
  reimbursementRequest: ReimbursementRequest;
  onSubmitData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
}> = ({ reimbursementRequest, onSubmitData }) => {
  const {
    data: receiptFiles,
    isLoading,
    isError,
    error
  } = useDownloadImages(reimbursementRequest.receiptPictures.map((pic) => pic.googleFileId));

  if (isError) return <ErrorPage error={error} />;
  if (!receiptFiles || isLoading) return <LoadingIndicator />;

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
          expenseTypeId: reimbursementRequest.expenseType.expenseTypeId,
          reimbursementProducts: reimbursementRequest.reimbursementProducts.map((product) => ({
            wbsNum: product.wbsNum,
            name: product.name,
            cost: product.cost
          })),
          receiptFiles: receiptFiles.map((file, index) => ({
            file,
            name: reimbursementRequest.receiptPictures[index].name,
            googleFileId: reimbursementRequest.receiptPictures[index].googleFileId
          }))
        }}
        previousPage={previousPage}
      />
    </PageLayout>
  );
};

export default EditReimbursementRequestRenderedDefaultValues;
