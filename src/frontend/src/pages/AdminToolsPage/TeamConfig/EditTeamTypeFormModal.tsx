import { TeamType as Division } from 'shared';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import DivisionFormModal from './TeamTypeFormModal';
import { useEditTeamType as useEditDivision } from '../../../hooks/team-types.hooks';

interface EditDivisionFormModalProps {
  open: boolean;
  handleClose: () => void;
  Division: Division;
}

const EditDivisionFormModal = ({ open, handleClose, Division }: EditDivisionFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditDivision(Division.teamTypeId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <DivisionFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={Division} />;
};

export default EditDivisionFormModal;
