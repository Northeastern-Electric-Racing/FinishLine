import { useCreateMachinery, MACHINERY_KEY } from '../../../../hooks/calendar.hooks';
import { postAddMachineryToShop } from '../../../../apis/calendar.api';
import { useQueryClient } from 'react-query';
import MachineryFormModal, { MachineryFormValues } from './MachineryFormModal';

interface CreateMachineryModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateMachineryModal = ({ open, onClose }: CreateMachineryModalProps) => {
  const { mutateAsync: createMachinery } = useCreateMachinery();
  const queryClient = useQueryClient();

  const onSubmit = async (data: MachineryFormValues) => {
    const { machineName, shopEntries } = data;
    // First create the machinery
    const createdMachinery = await createMachinery({ machineName });
    // Then add it to each shop
    let result = createdMachinery;
    for (const entry of shopEntries) {
      result = await postAddMachineryToShop({
        machineryId: createdMachinery.machineryId,
        shopId: entry.shopId,
        quantity: entry.quantity
      });
    }
    // Invalidate and refetch to ensure UI updates immediately
    await queryClient.invalidateQueries(MACHINERY_KEY);
    await queryClient.refetchQueries(MACHINERY_KEY);
    return result;
  };

  return <MachineryFormModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateMachineryModal;
