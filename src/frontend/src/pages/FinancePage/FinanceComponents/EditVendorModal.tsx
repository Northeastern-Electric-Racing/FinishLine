import { useEditVendor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';

import { Vendor } from 'shared';
import VendorFormModal from './VendorFormModal';

interface EditVendorModalProps {
  showModal: boolean;
  handleClose: () => void;
  vendor: Vendor;
}

const EditVendorModal = ({ showModal, handleClose, vendor }: EditVendorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditVendor(vendor.vendorId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <VendorFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={vendor} />;
};

export default EditVendorModal;
