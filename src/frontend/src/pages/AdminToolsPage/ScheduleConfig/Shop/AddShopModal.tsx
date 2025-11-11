import ShopModal, { ShopFormValues } from './ShopModal';

interface CreateShopModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ShopFormValues) => Promise<unknown> | unknown;
}

const CreateShopModal: React.FC<CreateShopModalProps> = (props) => {
  return <ShopModal {...props} initialValues={{ name: '', description: '' }} />;
};

export default CreateShopModal;
