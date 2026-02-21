import React from 'react';
import ShopModal, { ShopFormValues } from './ShopModal';
import { useEditShop } from '../../../../hooks/calendar.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { Shop } from 'shared';

export interface EditShopModalProps {
  open: boolean;
  onClose: () => void;
  shop: Shop;
}

const EditShopModal: React.FC<EditShopModalProps> = ({ open, onClose, shop }) => {
  const { mutateAsync: editShop } = useEditShop(shop.shopId);
  const toast = useToast();

  const initialValues: ShopFormValues = {
    name: shop.name,
    description: shop.description ?? ''
  };

  const onSubmit = async (data: ShopFormValues) => {
    try {
      const result = await editShop({
        name: data.name,
        description: data.description
      });
      toast.success('Shop updated successfully');
      return result;
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while updating the shop');
      }
      throw e;
    }
  };

  return <ShopModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} />;
};

export default EditShopModal;
