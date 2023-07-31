import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateAccountCode } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import AccountCodeFormModal from './AccountCodeFormModal';

interface CreateAccountCodeModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateAccountCodeModal = ({ showModal, handleClose }: CreateAccountCodeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateAccountCode();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <AccountCodeFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateAccountCodeModal;
