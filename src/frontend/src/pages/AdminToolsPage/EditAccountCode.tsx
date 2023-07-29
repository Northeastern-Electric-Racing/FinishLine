import { ExpenseType } from 'shared';
import EditAccountCodeView from './EditAccountCodeView';
import { useEditAccountCode } from '../../hooks/finance.hooks';
import { useParams } from 'react-router-dom';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';

interface EditAccountCodeProps {
  showModal: boolean;
  handleClose: () => void;
  accountCode: ExpenseType;
}

interface ParamTypes {
  reimbursementRequestId: string;
}

const EditAccountCode: React.FC<EditAccountCodeProps> = ({ showModal, handleClose, accountCode }: EditAccountCodeProps) => {
  const { reimbursementRequestId } = useParams<ParamTypes>();

  const { isLoading, isError, error, mutateAsync } = useEditAccountCode(reimbursementRequestId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const handleSubmit = async () => {
    handleClose();
    await mutateAsync(accountCode.code);
  };

  return (
    <EditAccountCodeView showModal={showModal} onHide={handleClose} onSubmit={handleSubmit} accountCode={accountCode} />
  );
};

export default EditAccountCode;
