import { Grid } from '@mui/material';
import { Availability, Event, getDayOfWeek, getNextSevenDays, User } from 'shared';
import {
  enumToArray,
  REVIEW_TIMES,
  HeatmapColors,
  getBackgroundColor,
  NUMBER_OF_TIME_SLOTS
} from '../../../utils/design-review.utils';
import TimeSlot from '../../../components/TimeSlot';
import React, { useState } from 'react';
import { datePipe } from '../../../utils/pipes';

interface AvailabilityScheduleViewProps {
  availableUsers: Map<number, User[]>;
  unavailableUsers: Map<number, User[]>;
  usersToAvailabilities: Map<User, Availability[]>;
  existingMeetingData: Map<number, string>;
  setCurrentAvailableUsers: (val: User[]) => void;
  setCurrentUnavailableUsers: (val: User[]) => void;
  dateRangeTitle: string;
  event: Event;
  displayDate?: Date;
}

const AvailabilityScheduleView: React.FC<AvailabilityScheduleViewProps> = ({
  availableUsers,
  unavailableUsers,
  usersToAvailabilities,
  existingMeetingData,
  setCurrentAvailableUsers,
  setCurrentUnavailableUsers,
  dateRangeTitle,
  event,
  displayDate
}) => {
  const totalUsers = usersToAvailabilities.size;
  const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);
  // Use displayDate if provided, otherwise fall back to event's initial date
  const initialDate = displayDate || event.scheduledTimes[0]?.initialDateScheduled || new Date();
  const potentialDays = getNextSevenDays(initialDate);

  const handleTimeslotClick = (index: number, _day: Date) => {
    if (selectedTimeslot === index) {
      setSelectedTimeslot(null);
      setCurrentAvailableUsers([]);
      setCurrentUnavailableUsers([]);
    } else {
      setSelectedTimeslot(index);
      setCurrentAvailableUsers(availableUsers.get(index) || []);
      setCurrentUnavailableUsers(unavailableUsers.get(index) || []);
    }
  };

  // Populates the availableUsers map
  for (let time = 0; time < NUMBER_OF_TIME_SLOTS; time++) {
    availableUsers.set(time, []);
  }
  usersToAvailabilities.forEach((availabilities, user) => {
    let i = 0;
    availabilities.forEach((availability) => {
      availability.availability.forEach((time) => {
        const usersAtTime = availableUsers.get(enumToArray(REVIEW_TIMES).length * i + time) || [];
        usersAtTime.push(user);
        availableUsers.set(enumToArray(REVIEW_TIMES).length * i + time, usersAtTime);
      });
      i++;
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
      <TimeSlot backgroundColor={HeatmapColors[0]} text={dateRangeTitle} />
      {potentialDays.map((day) => (
        <TimeSlot backgroundColor={HeatmapColors[0]} text={getDayOfWeek(day) + ' ' + datePipe(day)} fontSize={'1em'} />
      ))}
      {enumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container>
          <TimeSlot backgroundColor={HeatmapColors[0]} text={time} fontSize={'1em'} />
          {potentialDays.map((day, dayIndex) => {
            const index = dayIndex * enumToArray(REVIEW_TIMES).length + timeIndex;
            return (
              <TimeSlot
                key={index}
                backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                selected={selectedTimeslot === index}
                onClick={() => handleTimeslotClick(index, day)}
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
