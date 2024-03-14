import { Grid } from '@mui/material';
import { User } from 'shared';
import { useState } from 'react';
import ViewSchedule from './components/ViewSchedule';
import Availabilities from './components/Availabilities';

interface DRCViewProps {
  title: string;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
}

const DRCView: React.FC<DRCViewProps> = ({ usersToAvailabilities, existingMeetingData }) => {
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);

  return (
    <Grid container>
      <Grid item xs={9}>
        <ViewSchedule
          availableUsers={availableUsers}
          unavailableUsers={unavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
          existingMeetingData={existingMeetingData}
          setCurrentAvailableUsers={setCurrentAvailableUsers}
          setCurrentUnavailableUsers={setCurrentUnavailableUsers}
        />
      </Grid>
      <Grid item xs={3}>
        <Availabilities
          currentAvailableUsers={currentAvailableUsers}
          currentUnavailableUsers={currentUnavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
        />
      </Grid>
    </Grid>
  );
};

export default DRCView;
