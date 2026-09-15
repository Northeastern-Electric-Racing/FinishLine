import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateOtherProductReason } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import CategoryFormModal from './CategoryFormModal';
interface CreateCategoryModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateCategoryModal = ({ showModal, handleClose }: CreateCategoryModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateOtherProductReason();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <CategoryFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateCategoryModal;
