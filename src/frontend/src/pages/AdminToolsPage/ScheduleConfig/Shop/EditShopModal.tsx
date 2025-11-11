import ShopModal, { ShopFormValues } from './ShopModal';

export interface EditShopModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ShopFormValues) => Promise<unknown> | unknown;
  initialValues: Partial<ShopFormValues>;
}

const EditShopModal: React.FC<EditShopModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  return <ShopModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} />;
};

export default EditShopModal;
