import ShopModal, { ShopFormValues } from './ShopModal';

export interface EditShopModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ShopFormValues) => Promise<unknown> | unknown;
  initialValues: { name: string; description: string };
}

const EditShopModal: React.FC<EditShopModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  return <ShopModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} title="Edit Shop" />;
};

export default EditShopModal;
