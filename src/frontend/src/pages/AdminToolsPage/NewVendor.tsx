import NewVendorView from './NewVendorView';

interface NewVendorProps {
  showModal: boolean;
  handleClose: () => void;
}

const NewVendor: React.FC<NewVendorProps> = ({ showModal, handleClose }: NewVendorProps) => {
  const handleSubmit = async () => {
    handleClose();
  };

  return <NewVendorView showModal onHide={handleClose} onSubmit={handleSubmit} />;
};

export default NewVendor;
