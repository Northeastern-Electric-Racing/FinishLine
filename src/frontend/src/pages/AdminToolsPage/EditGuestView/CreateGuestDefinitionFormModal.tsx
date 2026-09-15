import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateGuestDefinition } from '../../../hooks/recruitment.hooks';
import { GuestDefinitionType } from 'shared';
import GuestDefinitionFormModal from './GuestDefinitionFormModal';

interface CreateGuestDefinitionFormModalProps {
  open: boolean;
  handleClose: () => void;
  type: GuestDefinitionType;
}

const CreateGuestDefinitionFormModal = ({ open, handleClose, type }: CreateGuestDefinitionFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateGuestDefinition();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <GuestDefinitionFormModal open={open} handleClose={handleClose} type={type} onSubmit={mutateAsync} />;
};

export default CreateGuestDefinitionFormModal;
