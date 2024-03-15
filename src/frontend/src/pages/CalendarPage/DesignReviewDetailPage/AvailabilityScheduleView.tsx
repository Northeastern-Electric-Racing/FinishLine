import { Grid } from '@mui/material';
import { User } from 'shared';
import {
  NUMBER_OF_TIME_SLOTS,
  EnumToArray,
  DAY_NAMES,
  REVIEW_TIMES,
  HeatmapColors,
  getBackgroundColor
} from '../../../utils/design-review.utils';
import TimeSlot from '../SchedulingComponents/TimeSlot';

interface AvailabilityScheduleViewProps {
  availableUsers: Map<number, User[]>;
  unavailableUsers: Map<number, User[]>;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
  setCurrentAvailableUsers: (val: User[]) => void;
  setCurrentUnavailableUsers: (val: User[]) => void;
}

const AvailabilityScheduleView: React.FC<AvailabilityScheduleViewProps> = ({
  availableUsers,
  unavailableUsers,
  usersToAvailabilities,
  existingMeetingData,
  setCurrentAvailableUsers,
  setCurrentUnavailableUsers
}) => {
  const totalUsers = usersToAvailabilities.size;

  const handleOnMouseOver = (index: number) => {
    setCurrentAvailableUsers(availableUsers.get(index) || []);
    setCurrentUnavailableUsers(unavailableUsers.get(index) || []);
  };

  const handleOnMouseLeave = () => {
    setCurrentAvailableUsers([]);
    setCurrentUnavailableUsers([]);
  };

  // Populates the availableUsers map
  for (let time = 0; time < NUMBER_OF_TIME_SLOTS; time++) {
    availableUsers.set(time, []);
  }
  usersToAvailabilities.forEach((availableTimes, user) => {
    availableTimes.forEach((time) => {
      const usersAtTime = availableUsers.get(time) || [];
      usersAtTime.push(user);
      availableUsers.set(time, usersAtTime);
    });
  });

  // Populates the unavailableUsers map
  const allUsers = [...usersToAvailabilities.keys()];
  for (let time = 0; time < NUMBER_OF_TIME_SLOTS; time++) {
    const currentUsers = availableUsers.get(time) || [];
    const currentUnavailableUsers = allUsers.filter((user) => !currentUsers.includes(user));
    unavailableUsers.set(time, currentUnavailableUsers);
  }

  return (
    <Grid container>
      <TimeSlot backgroundColor={HeatmapColors[0]} />
      {EnumToArray(DAY_NAMES).map((day) => (
        <TimeSlot backgroundColor={HeatmapColors[0]} text={day} fontSize={'1em'} />
      ))}
      {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container onMouseLeave={handleOnMouseLeave}>
          <TimeSlot backgroundColor={HeatmapColors[0]} text={time} fontSize={'1em'} />
          {EnumToArray(DAY_NAMES).map((_day, dayIndex) => {
            const index = dayIndex * EnumToArray(REVIEW_TIMES).length + timeIndex;
            return (
              <TimeSlot
                key={index}
                backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                onMouseOver={() => handleOnMouseOver(index)}
                icon={existingMeetingData.get(index)}
              />
            );
          })}
        </Grid>
      ))}
    </Grid>
  );
};

export default AvailabilityScheduleView;
