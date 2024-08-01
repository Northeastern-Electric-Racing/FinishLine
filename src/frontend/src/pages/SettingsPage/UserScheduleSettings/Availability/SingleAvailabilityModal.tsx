import { Availability } from 'shared';
import NERModal from '../../../../components/NERModal';
import SingleAvailabilityView from './SingleAvailabilityView';

interface SingleAvailabilityModalProps {
  open: boolean;
  header: string;
  availabilites: Availability[];
  onHide: () => void;
}

const SingleAvailabilityModal: React.FC<SingleAvailabilityModalProps> = ({ open, onHide, header, availabilites }) => {
  const existingMeetingData = new Map<number, { iconMap: Map<number, string> }>();

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onHide} hideFormButtons showCloseButton>
      <SingleAvailabilityView selectedTimes={availabilites} existingMeetingData={existingMeetingData} />
    </NERModal>
  );
};

export default SingleAvailabilityModal;
