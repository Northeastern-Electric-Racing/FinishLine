import { useCreateVendor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import VendorFormModal from './VendorFormModal';

interface CreateVendorModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateVendorModal = ({ showModal, handleClose }: CreateVendorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateVendor();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <VendorFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateVendorModal;
