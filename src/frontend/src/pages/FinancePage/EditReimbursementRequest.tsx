/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import ReimbursementRequestForm from './ReimbursementRequestForm/ReimbursementRequestForm';
import {
  ReimbursementRequestContentArgs,
  useDownloadImages,
  useEditReimbursementRequest,
  useSingleReimbursementRequest
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
  isLoading: boolean;
  mutateAsync: (data: ReimbursementRequestContentArgs) => Promise<ReimbursementRequest>;
}> = ({ reimbursementRequest, mutateAsync }) => {
  const {
    data: receiptFiles,
    isError,
    error
  } = useDownloadImages(reimbursementRequest.receiptPictures.map((pic) => pic.googleFileId));

  if (isError) return <ErrorPage error={error} />;
  if (!receiptFiles) return <LoadingIndicator />;

  return (
    <ReimbursementRequestForm
      submitText="Save"
      mutateAsync={mutateAsync}
      isLoading={false}
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
          file: { ...file, name: reimbursementRequest.receiptPictures[index].name }
        }))
      }}
    />
  );
};

const EditReimbursementRequestPage: React.FC = () => {
  const id = useParams<{ id: string }>().id;

  const { isLoading, mutateAsync } = useEditReimbursementRequest(id);
  const { isLoading: getIsLoading, isError, error, data: reimbursementRequest } = useSingleReimbursementRequest(id);

  if (isError) return <ErrorPage error={error} />;

  if (getIsLoading || !reimbursementRequest) return <LoadingIndicator />;

  return (
    <>
      <PageTitle
        title="Edit Reimbursement Request"
        previousPages={[
          {
            name: `${fullNamePipe(reimbursementRequest.recipient)} - ${datePipe(
              new Date(reimbursementRequest.dateOfExpense)
            )}`,
            route: `${routes.FINANCE}/${reimbursementRequest.reimbursementRequestId}`
          }
        ]}
      />
      <RenderedDefaultValues reimbursementRequest={reimbursementRequest} mutateAsync={mutateAsync} isLoading={isLoading} />
    </>
  );
};

export default EditReimbursementRequestPage;
