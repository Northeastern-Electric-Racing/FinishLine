import { useDeleteShop } from '../../../../hooks/calendar.hooks';
import NERDeleteModal from '../../../../components/NERDeleteModal';
import { Shop } from 'shared';

export interface DeleteShopModalProps {
  onClose: () => void;
  shop: Shop;
  isOpen: boolean;
}

const DeleteShopModal = ({ onClose, shop, isOpen }: DeleteShopModalProps) => {
  const { mutateAsync } = useDeleteShop();

  return (
    <NERDeleteModal 
      onFormSubmit={() => { 
        mutateAsync(shop.shopId); 
        onClose();
      }} 
      dataType={shop.name} 
      open={isOpen} 
      onHide={onClose}
    />
  );
};

export default DeleteShopModal;
