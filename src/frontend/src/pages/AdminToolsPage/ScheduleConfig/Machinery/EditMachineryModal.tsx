import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useEditMachinery, useAddMachineryToShop, MACHINERY_KEY } from '../../../../hooks/calendar.hooks';
import { postAddMachineryToShop } from '../../../../apis/calendar.api';
import { useQueryClient } from 'react-query';
import { Machinery } from 'shared';
import MachineryFormModal from './MachineryFormModal';
import { MachineryFormValues } from './MachineryFormModal';

interface EditMachineryModalProps {
  open: boolean;
  onClose: () => void;
  machinery: Machinery;
}

const EditMachineryModal = ({ open, onClose, machinery }: EditMachineryModalProps) => {
  const shopMachinery = machinery.shops?.[0];
  const originalShopId = shopMachinery?.shop?.shopId || '';
  const queryClient = useQueryClient();

  const {
    isLoading: isEditing,
    isError: isEditError,
    error: editError,
    mutateAsync: editMachinery
  } = useEditMachinery(machinery.machineryId);
  const {
    isLoading: isAdding,
    isError: isAddError,
    error: addError,
    mutateAsync: addMachineryToShop
  } = useAddMachineryToShop(machinery.machineryId);

  const isLoading = isEditing || isAdding;
  const isError = isEditError || isAddError;
  const error = editError || addError;

  const machineryData: MachineryFormValues = {
    shopId: originalShopId,
    machineName: machinery.name,
    quantity: shopMachinery?.quantity || 1
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: { shopId: string; machineName: string; quantity: number }) => {
    const { machineName, shopId, quantity } = data;
    let currentMachineryId = machinery.machineryId;

    // Check if name changed - this may merge with another machinery
    if (machineName !== machinery.name) {
      const updatedMachinery = await editMachinery({ machineName });
      currentMachineryId = updatedMachinery.machineryId;
    }

    // Update shop/quantity relationship using the current machinery ID
    if (currentMachineryId !== machinery.machineryId) {
      // Use the API directly since the machinery ID changed after merge
      const result = await postAddMachineryToShop({
        machineryId: currentMachineryId,
        shopId,
        quantity,
        originalShopId: originalShopId || undefined
      });
      queryClient.invalidateQueries(MACHINERY_KEY);
      return result;
    }

    // Same machinery ID, use the hook as normal
    return await addMachineryToShop({
      shopId,
      quantity,
      originalShopId: originalShopId || undefined
    });
  };

  return <MachineryFormModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={machineryData} />;
};

export default EditMachineryModal;
