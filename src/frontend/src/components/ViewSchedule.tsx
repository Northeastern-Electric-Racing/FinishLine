import { Grid } from '@mui/material';
import { User } from 'shared';
import {
  NUMBER_OF_TIME_SLOTS,
  EnumToArray,
  DAY_NAMES,
  REVIEW_TIMES,
  HeatmapColors,
  getBackgroundColor
} from '../utils/design-review.utils';
import TimeSlot from './TimeSlot';

interface ViewScheduleProps {
  availableUsers: Map<number, User[]>;
  unavailableUsers: Map<number, User[]>;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
  setCurrentAvailableUsers: (val: User[]) => void;
  setCurrentUnavailableUsers: (val: User[]) => void;
}

const ViewSchedule: React.FC<ViewScheduleProps> = ({
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
      <TimeSlot backgroundColor="#D9D9D9" isModal={false} />
      {EnumToArray(DAY_NAMES).map((day) => (
        <TimeSlot key={day} backgroundColor="#D9D9D9" text={day} fontSize={'1em'} isModal={false} />
      ))}
      {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container item xs={12} onMouseLeave={handleOnMouseLeave}>
          <TimeSlot backgroundColor={HeatmapColors.zero} text={time} fontSize={'1em'} isModal={false} />
          {EnumToArray(DAY_NAMES).map((_day, dayIndex) => {
            const index = dayIndex * EnumToArray(REVIEW_TIMES).length + timeIndex;
            return (
              <TimeSlot
                key={index}
                backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                onMouseOver={() => handleOnMouseOver(index)}
                isModal={false}
                icon={existingMeetingData.get(index)}
              />
            );
          })}
        </Grid>
      ))}
    </Grid>
  );
};

export default ViewSchedule;
