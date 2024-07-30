import TeamTypeFormModal from './TeamTypeFormModal';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateTeamType } from '../../../hooks/team-types.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import HelpIcon from '@mui/icons-material/Help';
import { CreateTeamTypePayload, useCreateTeamType } from '../../../hooks/design-reviews.hooks';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../utils/form';

const schema = yup.object().shape({
  name: yup.string().required('Material Type is Required'),
  iconName: yup.string().required('Icon Name is Required')
});

interface CreateTeamTypeModalProps {
  open: boolean;
  handleClose: () => void;
}

const CreateTeamTypeModal = ({ open, handleClose }: CreateTeamTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateTeamType();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <TeamTypeFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateTeamTypeModal;
