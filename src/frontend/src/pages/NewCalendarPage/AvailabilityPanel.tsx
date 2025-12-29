import { Box, Modal, Typography, Button, Drawer, useScrollTrigger } from '@mui/material';
import { Availability, Event, User, UserWithScheduleSettings } from 'shared';
import { useCurrentUser, useManyUsersWithScheduleSettings } from '../../hooks/users.hooks';
import { useMemo, useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

interface AvailabilityProps {
  open: boolean;
  onClose: () => void;
  event: Event | undefined;
}

const getAvailabilityKey = (uncomputed: Availability) => {
  return new Date(uncomputed.dateSet).toISOString().split('T')[0];
};

const updateYourAvailability = (key: string, index: number, map: Map<string, boolean[]>) => {
  if (map.has(key)) {
    const entry = map.get(key) ?? [];
    entry[index] = true;
  } else {
    const newMapEntry: boolean[] = Array.from({ length: 12 }, () => false);
    newMapEntry[index] = true;
    map.set(key, newMapEntry);
  }
};

// construct an array of availabilities, as well as a the users availabilities
const transformAvailabilities = (
  users: UserWithScheduleSettings[],
  setYourAvailabilities: (avails: Map<string, boolean[]>) => void,
  currUser: User
) => {
  const availabilityMap = new Map<string, User[][]>();
  const yourAvailabilityMap = new Map<string, boolean[]>();

  users.forEach((user) => {
    const isCurrUser = currUser.userId === user.userId;

    user.scheduleSettings?.availabilities.forEach((avs) => {
      const avDate = getAvailabilityKey(avs);

      if (availabilityMap.has(avDate)) {
        avs.availability.forEach((av) => {
          const oldValue = availabilityMap.get(avDate) ?? [];
          oldValue[av] = [...oldValue[av], user];
          if (isCurrUser) {
            updateYourAvailability(avDate, av, yourAvailabilityMap);
          }
        });
      } else {
        const newAvailArray: User[][] = Array.from({ length: 12 }, () => []);
        avs.availability.forEach((av) => {
          newAvailArray[av] = [user];
          if (isCurrUser) {
            updateYourAvailability(avDate, av, yourAvailabilityMap);
          }
        });

        availabilityMap.set(avDate, newAvailArray);
      }
    });
  });

  setYourAvailabilities(yourAvailabilityMap);

  return availabilityMap;
};

const convertToDisplay = (data: User[][]) => {
  const displayValue: string[] = [];

  data.forEach((d, i) => {
    const translatedNames = d.map((us) => `${us.firstName} ${us.lastName}`);
    displayValue.push(`${i} ${translatedNames.join(', ')}`);
  });

  return displayValue;
};

const AvailabilityPanel: React.FC<AvailabilityProps> = ({ open, onClose, event }) => {
  const user = useCurrentUser();

  const [yourAvailabilities, setYourAvailabilities] = useState<Map<string, boolean[]>>();

  const userIds = useMemo(
    () => [
      ...(event?.requiredMembers.map((member) => member.userId) ?? []),
      ...(event?.optionalMembers.map((member) => member.userId) ?? [])
    ],
    [event?.requiredMembers, event?.optionalMembers]
  );

  const { data: relevantUsers, isLoading, isError, error } = useManyUsersWithScheduleSettings(userIds);

  const availabilities = useMemo(
    () => transformAvailabilities(relevantUsers ?? [], setYourAvailabilities, user),
    [relevantUsers, user]
  );

  if (isLoading || !relevantUsers) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{}}>
      <Box sx={{ width: '50vw', height: '100vw', bgcolor: 'black', padding: '32px', position: 'relative' }}>
        <Typography variant="h4" component="h2" sx={{}}>
          Availabilities for {event?.title}
        </Typography>
        {Array.from(availabilities).map(([title, entry]) => (
          <Typography sx={{}}>
            {title} : {convertToDisplay(entry).join(', ')}
          </Typography>
        ))}
        <Button variant="contained" onClick={onClose} sx={{ mt: 2, mb: '16px' }}>
          Close
        </Button>
      </Box>
    </Drawer>
  );
};

export default AvailabilityPanel;
