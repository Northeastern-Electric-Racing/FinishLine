import { useCreateVendor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import VendorFormModal from './VendorFormModal';
import { Vendor } from 'shared';

interface CreateVendorModalProps {
  showModal: boolean;
  handleClose: () => void;
  vendors: Vendor[];
}

const CreateVendorModal = ({ showModal, handleClose, vendors }: CreateVendorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateVendor();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <VendorFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} vendors={vendors} />;
};

export default CreateVendorModal;
