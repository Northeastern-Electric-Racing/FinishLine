import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useCreatePartTag } from '../../../hooks/part-tag.hooks';
import PartTagModal from './PartTagModal';

interface CreatePartTagProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreatePartTagModal = ({ showModal, handleClose }: CreatePartTagProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreatePartTag();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <PartTagModal showModal={open} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreatePartTagModal;
