import React from 'react';
import ShopModal, { ShopFormValues } from './ShopModal';
import { useCreateShop } from '../../../../hooks/calendar.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';

interface CreateShopModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateShopModal: React.FC<CreateShopModalProps> = ({ open, onClose }) => {
  const { mutateAsync: createShop } = useCreateShop();
  const toast = useToast();

  const onSubmit = async (data: ShopFormValues) => {
    try {
      const result = await createShop({
        name: data.name,
        description: data.description
      });
      toast.success('Shop created successfully');
      return result;
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while creating the shop');
      }
      throw e;
    }
  };

  return <ShopModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateShopModal;
