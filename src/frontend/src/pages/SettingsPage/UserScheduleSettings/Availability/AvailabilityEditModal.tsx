import { Availability } from 'shared';
import NERModal from '../../../../components/NERModal';
import EditAvailability from './EditAvailability';

interface DRCEditModalProps {
  open: boolean;
  header: string;
  confirmedAvailabilities: Map<number, Availability>;
  totalAvailabilities: Availability[];
  setConfirmedAvailabilities: (availabilities: Map<number, Availability>) => void;
  onHide: () => void;
  onSubmit: () => void;
  initialDate: Date;
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
  initialDate,
  canChangeDateRange = true
}) => {
  const existingMeetingData = new Map<number, { iconMap: Map<number, string> }>();
  const onCancel = () => {
    setConfirmedAvailabilities(new Map());
    onHide();
  };

  return (
    <NERModal open={open} onHide={onCancel} title={header} onSubmit={onSubmit} submitText="Save">
      <EditAvailability
        editedAvailabilities={confirmedAvailabilities}
        setEditedAvailabilities={setConfirmedAvailabilities}
        existingMeetingData={existingMeetingData}
        totalAvailabilities={totalAvailabilities}
        canChangeDateRange={canChangeDateRange}
        initialDate={initialDate}
      />
    </NERModal>
  );
};

export default AvailabilityEditModal;
