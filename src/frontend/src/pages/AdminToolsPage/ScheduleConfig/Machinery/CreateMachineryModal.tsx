import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateMachinery, MACHINERY_KEY } from '../../../../hooks/calendar.hooks';
import { postAddMachineryToShop } from '../../../../apis/calendar.api';
import { useQueryClient } from 'react-query';
import MachineryFormModal from './MachineryFormModal';

interface CreateMachineryModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateMachineryModal = ({ open, onClose }: CreateMachineryModalProps) => {
  const { isLoading, isError, error, mutateAsync: createMachinery } = useCreateMachinery();
  const queryClient = useQueryClient();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: { shopId: string; machineName: string; quantity: number }) => {
    const { machineName, shopId, quantity } = data;
    // First create the machinery
    const createdMachinery = await createMachinery({ machineName });
    // Then add it to the shop
    const result = await postAddMachineryToShop({
      machineryId: createdMachinery.machineryId,
      shopId,
      quantity
    });
    queryClient.invalidateQueries(MACHINERY_KEY);
    return result;
  };

  return <MachineryFormModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateMachineryModal;
