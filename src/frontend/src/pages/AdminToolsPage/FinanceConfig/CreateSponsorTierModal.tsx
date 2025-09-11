import SponsorTierModal from './SponsorTierModal';
import { useCreateSponsorTier } from '../../../hooks/finance.hooks';

interface CreateSponsorTierModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateSponsorTierModal: React.FC<CreateSponsorTierModalProps> = ({ showModal, handleClose }) => {
  const { mutateAsync } = useCreateSponsorTier();

  return <SponsorTierModal showModal={showModal} handleClose={handleClose} mutateAsync={mutateAsync} />;
};

export default CreateSponsorTierModal;
