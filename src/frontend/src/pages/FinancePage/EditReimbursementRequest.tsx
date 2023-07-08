/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from './ReimbursementRequestForm/ReimbursementRequestForm';
import {
  useDownloadImages,
  useEditReimbursementRequest,
  useSingleReimbursementRequest,
  useUploadManyReceipts
} from '../../hooks/finance.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { useParams } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { datePipe, fullNamePipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { ReimbursementRequest } from 'shared';

const RenderedDefaultValues: React.FC<{
  reimbursementRequest: ReimbursementRequest;
  submitData: (data: ReimbursementRequestDataSubmission) => Promise<string>;
}> = ({ reimbursementRequest, submitData }) => {
  const {
    data: receiptFiles,
    isLoading,
    isError,
    error
  } = useDownloadImages(reimbursementRequest.receiptPictures.map((pic) => pic.googleFileId));

  if (isError) return <ErrorPage error={error} />;
  if (!receiptFiles || isLoading) return <LoadingIndicator />;

  const previousPage = `${routes.FINANCE}/${reimbursementRequest.reimbursementRequestId}`;

  return (
    <>
      <PageTitle
        title="Edit Reimbursement Request"
        previousPages={[
          {
            name: `${fullNamePipe(reimbursementRequest.recipient)} - ${datePipe(
              new Date(reimbursementRequest.dateOfExpense)
            )}`,
            route: previousPage
          }
        ]}
      />
      <ReimbursementRequestForm
        submitText="Save"
        submitData={submitData}
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
    </>
  );
};

const EditReimbursementRequestPage: React.FC = () => {
  const id = useParams<{ id: string }>().id;

  const { isLoading: editReimbursementRequestIsLoading, mutateAsync: editReimbursementRequest } =
    useEditReimbursementRequest(id);
  const { isLoading: uploadReceiptsIsLoading, mutateAsync: uploadReceipts } = useUploadManyReceipts();
  const { isLoading: getIsLoading, isError, error, data: reimbursementRequest } = useSingleReimbursementRequest(id);

  if (isError) return <ErrorPage error={error} />;

  if (getIsLoading || editReimbursementRequestIsLoading || uploadReceiptsIsLoading || !reimbursementRequest)
    return <LoadingIndicator />;

  const onSubmit = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const filesToKeep = data.receiptFiles.filter((file) => file.googleFileId !== '');
    console.log(filesToKeep);
    await editReimbursementRequest({ ...data, receiptPictures: filesToKeep });
    await uploadReceipts({
      id: reimbursementRequest.reimbursementRequestId,
      files: data.receiptFiles.filter((receipt) => receipt.googleFileId === '').map((file) => file.file)
    });
    return reimbursementRequest.reimbursementRequestId;
  };

  return <RenderedDefaultValues reimbursementRequest={reimbursementRequest} submitData={onSubmit} />;
};

export default EditReimbursementRequestPage;
