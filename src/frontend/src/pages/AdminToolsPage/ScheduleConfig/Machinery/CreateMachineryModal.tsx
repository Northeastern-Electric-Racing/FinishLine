import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateMachinery } from '../../../../hooks/calendar.hooks';
import MachineryFormModal from './MachineryFormModal';

interface CreateMachineryModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateMachineryModal = ({ open, onClose }: CreateMachineryModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateMachinery();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <MachineryFormModal open={open} onClose={onClose} onSubmit={mutateAsync} />;
};

export default CreateMachineryModal;
