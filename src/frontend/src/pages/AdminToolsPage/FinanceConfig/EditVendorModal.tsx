import { useEditVendor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import VendorFormModal from './VendorFormModal';
import { Vendor } from 'shared';

interface EditVendorModalProps {
  showModal: boolean;
  handleClose: () => void;
  vendor: Vendor;
  vendors: Vendor[];
}

const CreateVendorModal = ({ showModal, handleClose, vendor, vendors }: EditVendorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditVendor(vendor.vendorId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <VendorFormModal
      showModal={showModal}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      defaultValues={vendor}
      vendors={vendors}
    />
  );
};

export default CreateVendorModal;
