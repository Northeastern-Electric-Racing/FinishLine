import CategoryFormModal from './CategoryFormModal';
import { useEditOtherProductReason } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { OtherProductReason } from 'shared';

interface EditCategoryModalProps {
  showModal: boolean;
  handleClose: () => void;
  category: OtherProductReason;
}

const EditCategoryModal = ({ showModal, handleClose, category }: EditCategoryModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditOtherProductReason(category.otherProductReasonId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <CategoryFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={category} />
  );
};

export default EditCategoryModal;
