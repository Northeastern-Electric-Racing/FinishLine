import { useDeleteAccountCode } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { AccountCode } from 'shared';
import NERModal from '../../../components/NERModal';
import { Typography } from '@mui/material';

interface DeleteAccountCodeModalProps {
  handleClose: () => void;
  accountCode: AccountCode;
}

const DeleteCategoryModal = ({ handleClose, accountCode }: DeleteAccountCodeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useDeleteAccountCode();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERModal
      open={!!accountCode}
      title="Delete Account Code"
      onHide={handleClose}
      submitText="Yes"
      cancelText="No"
      onSubmit={() => {
        mutateAsync(accountCode.accountCodeId);
        handleClose();
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '20px' }}>
        Do you want to <u>delete</u> account code: {accountCode.code} - {accountCode.name}?
      </Typography>
    </NERModal>
  );
};

export default DeleteCategoryModal;
