import { Grid } from '@mui/material';
import { Availability, DesignReview, getDayOfWeek, getNextSevenDays, User } from 'shared';
import {
  EnumToArray,
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
  onSelectedTimeslotChanged: (val: number | null) => void;
  dateRangeTitle: string;
  designReview: DesignReview;
}

const AvailabilityScheduleView: React.FC<AvailabilityScheduleViewProps> = ({
  availableUsers,
  unavailableUsers,
  usersToAvailabilities,
  existingMeetingData,
  setCurrentAvailableUsers,
  setCurrentUnavailableUsers,
  dateRangeTitle,
  onSelectedTimeslotChanged,
  designReview
}) => {
  const totalUsers = usersToAvailabilities.size;
  const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);
  const potentialDays = getNextSevenDays(designReview.initialDate);

  const handleTimeslotClick = (index: number) => {
    if (selectedTimeslot === index) {
      setSelectedTimeslot(null); // unselect
      setCurrentAvailableUsers([]);
      setCurrentUnavailableUsers([]);
    } else {
      setSelectedTimeslot(index); // select
      setCurrentAvailableUsers(availableUsers.get(index) || []);
      setCurrentUnavailableUsers(unavailableUsers.get(index) || []);
    }

    onSelectedTimeslotChanged(index);
  };

  const handleOnMouseOver = (index: number) => {
    setCurrentAvailableUsers(availableUsers.get(index) || []);
    setCurrentUnavailableUsers(unavailableUsers.get(index) || []);
  };

  const handleOnMouseLeave = () => {
    if (selectedTimeslot === null) {
      setCurrentAvailableUsers([]);
      setCurrentUnavailableUsers([]);
    }
  };

  // Populates the availableUsers map
  for (let time = 0; time < NUMBER_OF_TIME_SLOTS; time++) {
    availableUsers.set(time, []);
  }
  usersToAvailabilities.forEach((availabilities, user) => {
    availabilities.forEach((availability) => {
      availability.availability.forEach((time) => {
        const usersAtTime = availableUsers.get(time) || [];
        usersAtTime.push(user);
        availableUsers.set(time, usersAtTime);
      });
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
        <TimeSlot
          backgroundColor={HeatmapColors[0]}
          text={getDayOfWeek(day) + ' ' + datePipe(day)}
          fontSize={'1em'}
        />
      ))}
      {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container onMouseLeave={handleOnMouseLeave}>
          <TimeSlot backgroundColor={HeatmapColors[0]} text={time} fontSize={'1em'} />
          {potentialDays.map((_day, dayIndex) => {
            const index = dayIndex * EnumToArray(REVIEW_TIMES).length + timeIndex;
            return (
              <TimeSlot
                key={index}
                backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                selected={selectedTimeslot === index}
                onClick={() => handleTimeslotClick(index)}
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
