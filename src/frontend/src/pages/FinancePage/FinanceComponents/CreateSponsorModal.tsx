import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import { SponsorFormModal } from './SponsorFormModal';

interface CreateSponsorModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateSponsorModal = ({ showModal, handleClose }: CreateSponsorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateSponsor();
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <SponsorFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} />;
};

export default CreateSponsorModal;
