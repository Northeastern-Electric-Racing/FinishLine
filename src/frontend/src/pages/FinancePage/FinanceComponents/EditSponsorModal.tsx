import { Sponsor } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import { SponsorFormModal } from './SponsorFormModal';

interface EditSponsorModalProps {
  showModal: boolean;
  handleClose: () => void;
  sponsor: Sponsor;
}

const EditSponsorModal = ({ showModal, handleClose, sponsor }: EditSponsorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateSponsor();
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <SponsorFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={sponsor} />;
};

export default EditSponsorModal;
