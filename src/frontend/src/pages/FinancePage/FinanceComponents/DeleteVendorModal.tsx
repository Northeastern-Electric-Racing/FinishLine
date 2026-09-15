import { useDeleteVendor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Vendor } from 'shared';
import NERModal from '../../../components/NERModal';
import { Typography } from '@mui/material';

interface DeleteVendorModalProps {
  handleClose: () => void;
  vendor: Vendor;
}

const DeleteVendorModal = ({ handleClose, vendor }: DeleteVendorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useDeleteVendor();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERModal
      open={!!vendor}
      title="Warning!"
      onHide={handleClose}
      submitText="Delete"
      onSubmit={() => {
        mutateAsync(vendor.vendorId);
        handleClose();
      }}
    >
      <Typography gutterBottom>
        Are you sure you want to delete the vendor <i>{vendor.name}</i>?
      </Typography>
      <Typography fontWeight="bold">This action cannot be undone!</Typography>
    </NERModal>
  );
};

export default DeleteVendorModal;
