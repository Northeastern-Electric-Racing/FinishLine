import { Availability } from 'shared';
import NERModal from '../../../../components/NERModal';
import SingleAvailabilityView from './SingleAvailabilityView';

interface SingleAvailabilityModalProps {
  open: boolean;
  header: string;
  availabilites: Availability[];
  onHide: () => void;
  initialDate?: Date;
}

const SingleAvailabilityModal: React.FC<SingleAvailabilityModalProps> = ({
  open,
  onHide,
  header,
  availabilites,
  initialDate
}) => {
  return (
    <NERModal
      open={open}
      onHide={onHide}
      title={header}
      onSubmit={onHide}
      hideFormButtons
      showCloseButton
      paperProps={{ maxWidth: '1200px', maxHeight: '680px' }}
    >
      <SingleAvailabilityView totalAvailability={availabilites} initialDate={initialDate} />
    </NERModal>
  );
};

export default SingleAvailabilityModal;
