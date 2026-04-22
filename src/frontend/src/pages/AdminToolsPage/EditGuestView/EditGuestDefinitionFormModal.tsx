import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useEditGuestDefinitions } from '../../../hooks/recruitment.hooks';
import { GuestDefinition } from 'shared';
import GuestDefinitionFormModal from './GuestDefinitionFormModal';

interface EditGuestDefinitionFormModalProps {
  open: boolean;
  handleClose: () => void;
  definition: GuestDefinition;
}

const EditGuestDefinitionFormModal = ({ open, handleClose, definition }: EditGuestDefinitionFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditGuestDefinitions(definition.definitionId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <GuestDefinitionFormModal
      open={open}
      handleClose={handleClose}
      type={definition.type}
      defaultValues={definition}
      onSubmit={mutateAsync}
    />
  );
};

export default EditGuestDefinitionFormModal;
