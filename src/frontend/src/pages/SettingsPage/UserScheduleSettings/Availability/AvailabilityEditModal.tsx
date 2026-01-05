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
  const onCancel = () => {
    setConfirmedAvailabilities(new Map());
    onHide();
  };

  return (
    <NERModal
      open={open}
      onHide={onCancel}
      title={header}
      onSubmit={onSubmit}
      submitText="Save"
      paperProps={{ maxWidth: '1200px', maxHeight: '680px' }}
    >
      <EditAvailability
        editedAvailabilities={confirmedAvailabilities}
        setEditedAvailabilities={setConfirmedAvailabilities}
        totalAvailabilities={totalAvailabilities}
        canChangeDateRange={canChangeDateRange}
        initialDate={initialDate}
      />
    </NERModal>
  );
};

export default AvailabilityEditModal;
