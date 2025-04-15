import { AccountCode } from 'shared';
import AccountCodeFormModal from './AccountCodeFormModal';
import { useEditAccountCode } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface EditCategoryModalProps {
  showModal: boolean;
  handleClose: () => void;
  accountCode: AccountCode;
}

const EditCategoryModal = ({ showModal, handleClose, accountCode }: EditCategoryModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditAccountCode(accountCode.accountCodeId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <IndexCodeFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={accountCode} />
  );
};

export default EditCategoryModal;
