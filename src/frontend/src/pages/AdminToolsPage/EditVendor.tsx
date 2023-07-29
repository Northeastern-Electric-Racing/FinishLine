import { Vendor } from 'shared';
import EditVendorView from './EditVendorView';

interface EditVendorProps {
  showModal: boolean;
  handleClose: () => void;
  vendor: Vendor;
}

const EditVendor: React.FC<EditVendorProps> = ({ showModal, handleClose, vendor }: EditVendorProps) => {
  const handleConfirm = async () => {
    handleClose();
  };

  return <EditVendorView showModal={showModal} onHide={handleClose} vendor={vendor} onSubmit={handleConfirm} />;
};

export default EditVendor;
