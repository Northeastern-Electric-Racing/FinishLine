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
  const { isLoading, isError, error, mutateAsync } = useEditMachinery(machinery.machineryId);

  const machineryData: MachineryFormValues = {
    shopId: machinery.shops?.[0]?.shop?.shopId || '',
    machineName: machinery.name,
    quantity: machinery.shops?.[0]?.quantity || 1
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <MachineryFormModal open={open} onClose={onClose} onSubmit={mutateAsync} initialValues={machineryData} />;
};

export default EditMachineryModal;
