import { Shop } from 'shared';
import NERModal from '../../../../components/NERModal';
import { Typography } from '@mui/material';
import { useDeleteShop } from '../../../../hooks/calendar.hooks';

export interface DeleteShopModalProps {
  onClose: () => void;
  shop: Shop;
}

const DeleteShopModal = ({ onClose, shop }: DeleteShopModalProps) => {
  const { mutateAsync } = useDeleteShop();

  return (
    <NERModal
      open={!!shop}
      onHide={onClose}
      title="Delete Shop:"
      submitText="Yes"
      cancelText="No"
      onSubmit={() => {
        mutateAsync(shop?.shopId);
        onClose();
      }}
      showCloseButton
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '20px' }}>
        Do you want to <u>delete</u> shop: {shop?.name}?
      </Typography>
    </NERModal>
  );
};

export default DeleteShopModal;
