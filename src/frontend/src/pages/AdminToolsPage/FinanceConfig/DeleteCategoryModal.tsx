import { useDeleteOtherProductReason } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { OtherProductReason } from 'shared';
import NERModal from '../../../components/NERModal';
import { Typography } from '@mui/material';
import { displayEnum } from '../../../utils/pipes';

interface DeleteCategoryModalProps {
  handleClose: () => void;
  category: OtherProductReason;
}

const DeleteCategoryModal = ({ handleClose, category }: DeleteCategoryModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useDeleteOtherProductReason();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERModal
      open={!!category}
      title="Delete Category"
      onHide={handleClose}
      submitText="Yes"
      cancelText="No"
      onSubmit={() => {
        mutateAsync(category.otherProductReasonId);
        handleClose();
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '20px' }}>
        Do you want to <u>delete</u> {displayEnum(category.name)}?
      </Typography>
    </NERModal>
  );
};

export default DeleteCategoryModal;
