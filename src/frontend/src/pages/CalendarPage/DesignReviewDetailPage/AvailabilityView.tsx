import { Grid } from '@mui/material';
import { User } from 'shared';
import { useState } from 'react';
import AvailabilityScheduleView from './AvailabilityScheduleView';
import UserAvailabilites from './UserAvailabilitesView';

interface AvailabilityViewProps {
  title: string;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
}

const AvailabilityView: React.FC<AvailabilityViewProps> = ({ usersToAvailabilities, existingMeetingData }) => {
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

  return (
    <Grid container>
      <Grid item xs={9}>
        <AvailabilityScheduleView
          availableUsers={availableUsers}
          unavailableUsers={unavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
          existingMeetingData={existingMeetingData}
          setCurrentAvailableUsers={setCurrentAvailableUsers}
          setCurrentUnavailableUsers={setCurrentUnavailableUsers}
        />
      </Grid>
      <Grid item xs={3}>
        <UserAvailabilites
          currentAvailableUsers={currentAvailableUsers}
          currentUnavailableUsers={currentUnavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
        />
      </Grid>
    </Grid>
  );
};

export default AvailabilityView;
