import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useEditMachinery } from '../../../../hooks/calendar.hooks';
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
  const shopMachineryId = shopMachinery?.shopMachineryId || '';

  const { isLoading, isError, error, mutateAsync } = useEditMachinery(machinery.machineryId);

  const machineryData: MachineryFormValues = {
    shopId: originalShopId,
    machineName: machinery.name,
    quantity: shopMachinery?.quantity || 1
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: { shopId: string; machineName: string; quantity: number }) => {
    return await mutateAsync({
      ...data,
      originalShopId,
      shopMachineryId
    });
  };

  return <MachineryFormModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={machineryData} />;
};

export default EditMachineryModal;
