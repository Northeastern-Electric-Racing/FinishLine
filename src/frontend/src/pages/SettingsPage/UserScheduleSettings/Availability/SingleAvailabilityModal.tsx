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
  const existingMeetingData = new Map<number, { iconMap: Map<number, string> }>();

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onHide} hideFormButtons showCloseButton>
      <SingleAvailabilityView
        totalAvailability={availabilites}
        existingMeetingData={existingMeetingData}
        initialDate={initialDate}
      />
    </NERModal>
  );
};

export default SingleAvailabilityModal;
