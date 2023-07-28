import NewVendorView from './NewVendorView';

interface NewVendorProps {
  showModal: boolean;
  handleClose: () => void;
}

const handleSubmit = async () => {};

const NewVendor: React.FC<NewVendorProps> = ({ showModal, handleClose }: NewVendorProps) => {
  return <NewVendorView showModal onHide={handleClose} onSubmit={handleSubmit} />;
};

export default NewVendor;
