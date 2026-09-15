import SponsorTierModal from './SponsorTierModal';
import { useEditSponsorTier } from '../../../hooks/finance.hooks';
import { SponsorTier } from 'shared';

interface EditSponsorTierModalProps {
  showModal: boolean;
  handleClose: () => void;
  sponsorTier: SponsorTier;
}

const CreateSponsorTierModal: React.FC<EditSponsorTierModalProps> = ({ showModal, handleClose, sponsorTier }) => {
  const { mutateAsync } = useEditSponsorTier(sponsorTier.sponsorTierId);

  return (
    <SponsorTierModal
      defaultValues={sponsorTier}
      showModal={showModal}
      handleClose={handleClose}
      mutateAsync={mutateAsync}
    />
  );
};

export default CreateSponsorTierModal;
