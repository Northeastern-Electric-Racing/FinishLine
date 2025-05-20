import DivisionFormModal from './TeamTypeFormModal';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateDivision } from '../../../hooks/team-types.hooks';

interface CreateDivisionFormModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateDivisionFormModal = ({ open, handleClose }: CreateDivisionFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateDivision();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <DivisionFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateDivisionFormModal;
