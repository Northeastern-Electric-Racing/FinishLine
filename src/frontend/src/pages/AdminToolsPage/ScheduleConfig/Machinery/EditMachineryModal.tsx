import { useEditMachinery, MACHINERY_KEY } from '../../../../hooks/calendar.hooks';
import { postAddMachineryToShop } from '../../../../apis/calendar.api';
import { useQueryClient } from 'react-query';
import { Machinery } from 'shared';
import MachineryFormModal, { MachineryFormValues } from './MachineryFormModal';

interface EditMachineryModalProps {
  open: boolean;
  onClose: () => void;
  machinery: Machinery;
}

const EditMachineryModal = ({ open, onClose, machinery }: EditMachineryModalProps) => {
  const queryClient = useQueryClient();
  const { mutateAsync: editMachinery } = useEditMachinery(machinery.machineryId);

  const originalShops = machinery.shops || [];

  const machineryData: MachineryFormValues = {
    machineName: machinery.name,
    shopEntries:
      originalShops.length > 0
        ? originalShops.map((sm) => ({ shopId: sm.shop.shopId, quantity: sm.quantity }))
        : [{ shopId: '', quantity: 1 }]
  };

  const onSubmit = async (data: MachineryFormValues) => {
    const { machineName, shopEntries } = data;
    let currentMachineryId = machinery.machineryId;

    // Check if name changed - this may merge with another machinery
    if (machineName !== machinery.name) {
      const updatedMachinery = await editMachinery({ machineName });
      currentMachineryId = updatedMachinery.machineryId;
    }

    const newShopIds = new Set(shopEntries.map((e) => e.shopId));

    // Remove shops that were removed from the form
    for (const sm of originalShops) {
      if (!newShopIds.has(sm.shop.shopId)) {
        await postAddMachineryToShop({
          machineryId: currentMachineryId,
          shopId: sm.shop.shopId,
          quantity: 0
        });
      }
    }

    // Add or update shop entries
    for (const entry of shopEntries) {
      if (!entry.shopId) continue;
      const original = originalShops.find((sm) => sm.shop.shopId === entry.shopId);
      if (original) {
        // Existing shop - update if quantity changed
        if (original.quantity !== entry.quantity) {
          await postAddMachineryToShop({
            machineryId: currentMachineryId,
            shopId: entry.shopId,
            quantity: entry.quantity,
            originalShopId: entry.shopId
          });
        }
      } else {
        // New shop association
        await postAddMachineryToShop({
          machineryId: currentMachineryId,
          shopId: entry.shopId,
          quantity: entry.quantity
        });
      }
    }

    await queryClient.invalidateQueries(MACHINERY_KEY);
    await queryClient.refetchQueries(MACHINERY_KEY);
    return machinery;
  };

  return <MachineryFormModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={machineryData} />;
};

export default EditMachineryModal;
