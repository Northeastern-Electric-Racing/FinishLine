import NERModal from '../../../../components/NERModal';
import EditAvailability from './EditAvailability';

interface DRCEditModalProps {
  open: boolean;
  header: string;
  availabilites: number[];
  setAvailabilities: (availabilities: number[]) => void;
  onHide: () => void;
  onSubmit: () => void;
}

const AvailabilityEditModal: React.FC<DRCEditModalProps> = ({
  open,
  onHide,
  header,
  availabilites,
  setAvailabilities,
  onSubmit
}) => {
  const existingMeetingData = new Map<number, string>();

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onSubmit} submitText="Save">
      <EditAvailability
        selectedTimes={availabilites}
        setSelectedTimes={setAvailabilities}
        existingMeetingData={existingMeetingData}
      />
    </NERModal>
  );
};

export default AvailabilityEditModal;
