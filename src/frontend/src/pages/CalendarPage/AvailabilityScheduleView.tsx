import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Availability, Event, getDayOfWeek, getNextSevenDays, User } from 'shared';
import React, { useState } from 'react';
import { enumToArray, getBackgroundColor, NUMBER_OF_TIME_SLOTS, REVIEW_TIMES } from '../../utils/design-review.utils';
import { datePipe } from '../../utils/pipes';
import EventTimeSlot from './Components/EventTimeSlot';

interface AvailabilityScheduleViewProps {
  availableUsers: Map<number, User[]>;
  unavailableUsers: Map<number, User[]>;
  usersToAvailabilities: Map<User, Availability[]>;
  setCurrentAvailableUsers: (val: User[]) => void;
  setCurrentUnavailableUsers: (val: User[]) => void;
  event: Event;
  displayDate?: Date;
}

const AvailabilityScheduleView: React.FC<AvailabilityScheduleViewProps> = ({
  availableUsers,
  unavailableUsers,
  usersToAvailabilities,
  setCurrentAvailableUsers,
  setCurrentUnavailableUsers,
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

  const stickyLeft = {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    bgcolor: 'background.paper'
  };

  return (
    <TableContainer
      sx={{
        overflowX: 'auto',
        overflowY: 'auto',
        maxWidth: '100%'
      }}
    >
      <Table
        stickyHeader
        sx={{
          '& .MuiTableCell-head': {
            bgcolor: 'background.paper'
          },
          minWidth: 650
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {potentialDays.map((day) => (
              <TableCell>
                <Typography flexGrow={1} variant="h6" align="center" sx={{ fontSize: { xs: 12, md: 16 } }}>
                  {getDayOfWeek(day) + ' ' + datePipe(day)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {enumToArray(REVIEW_TIMES).map((time, timeIndex) => (
            <TableRow>
              <TableCell sx={{ ...stickyLeft, zIndex: 1 }}>
                <Typography flexGrow={1} variant="h6" align="center" sx={{ fontSize: { xs: 12, md: 16 } }}>
                  {time}
                </Typography>
              </TableCell>
              {potentialDays.map((day, dayIndex) => {
                const index = dayIndex * enumToArray(REVIEW_TIMES).length + timeIndex;
                return (
                  <TableCell sx={{ p: 0 }}>
                    <EventTimeSlot
                      key={index}
                      backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                      selected={selectedTimeslot === index}
                      onClick={() => handleTimeslotClick(index, day)}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AvailabilityScheduleView;
