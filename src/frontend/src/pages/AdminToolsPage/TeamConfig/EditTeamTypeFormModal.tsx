import { TeamType } from 'shared';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import TeamTypeFormModal from './TeamTypeFormModal';
import { useEditTeamType } from '../../../hooks/team-types.hooks';

interface EditTeamTypeFormModalProps {
  open: boolean;
  handleClose: () => void;
  teamType: TeamType;
}

const EditTeamTypeFormModal = ({ open, handleClose, teamType }: EditTeamTypeFormModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditTeamType(teamType.teamTypeId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <TeamTypeFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} defaulValues={teamType} />;
};

export default EditTeamTypeFormModal;
