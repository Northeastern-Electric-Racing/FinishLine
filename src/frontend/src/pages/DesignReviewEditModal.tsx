import NERModal from '../components/NERModal';
import { useState } from 'react';
import { existingMeetingData } from '../utils/design-review.utils';
import { User } from 'shared';
import EditSchedule from '../components/EditSchedule';

interface DRCEditModalProps {
  open: boolean;
  description: string;
  time: string;
  location: string;
  onHide: () => void;
  onSubmit?: () => void;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
}

const DRCEditModal: React.FC<DRCEditModalProps> = ({ open, onHide, onSubmit, description, time, location }) => {
  const header = `Are you availble for the ${description} Design Review at ${time} in the ${location}`;
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);

  return (
    <NERModal
      open={open}
      onHide={() => {
        onHide();
        setSelectedTimes([]);
      }}
      title={header}
      onSubmit={onSubmit}
    >
      <EditSchedule
        selectedTimes={selectedTimes}
        setSelectedTimes={setSelectedTimes}
        existingMeetingData={existingMeetingData}
      />
    </NERModal>
  );
};

export default DRCEditModal;
