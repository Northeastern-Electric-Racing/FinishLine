import { Availability } from 'shared';
import NERModal from '../../../../components/NERModal';
import EditAvailability from './EditAvailability';

interface DRCEditModalProps {
  open: boolean;
  header: string;
  confirmedAvailabilities: Availability[];
  totalAvailabilities: Availability[];
  setConfirmedAvailabilities: (availabilities: Availability[]) => void;
  onHide: () => void;
  onSubmit: () => void;
  canChangeDateRange?: boolean;
}

const AvailabilityEditModal: React.FC<DRCEditModalProps> = ({
  open,
  onHide,
  header,
  confirmedAvailabilities,
  setConfirmedAvailabilities,
  totalAvailabilities,
  onSubmit,
  canChangeDateRange = true
}) => {
  const existingMeetingData = new Map<number, { iconMap: Map<number, string> }>();

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onSubmit} submitText="Save">
      <EditAvailability
        selectedAvailabilities={confirmedAvailabilities}
        setSelectedAvailabilities={setConfirmedAvailabilities}
        existingMeetingData={existingMeetingData}
        totalAvailabilities={totalAvailabilities}
        canChangeDateRange={canChangeDateRange}
      />
    </NERModal>
  );
};

export default AvailabilityEditModal;
