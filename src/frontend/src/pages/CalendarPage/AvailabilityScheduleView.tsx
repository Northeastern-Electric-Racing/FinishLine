import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Availability, Event, EventWithMembers, getDayOfWeek, getNextSevenDays, User } from 'shared';
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
  setCurrentHoveredSlot?: (slot: { day: Date; startHour: number; endHour: number } | null) => void;
  event: Event | EventWithMembers;
  displayDate?: Date;
  onSlotScheduleClick?: (day: Date | null, startHour: number, endHour: number) => void;
}

const AvailabilityScheduleView: React.FC<AvailabilityScheduleViewProps> = ({
  availableUsers,
  unavailableUsers,
  usersToAvailabilities,
  setCurrentAvailableUsers,
  setCurrentUnavailableUsers,
  setCurrentHoveredSlot,
  event,
  displayDate,
  onSlotScheduleClick
}) => {
  const totalUsers = usersToAvailabilities.size;
  const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);

  // Use displayDate if provided, otherwise fall back to event's initial date.
  const initialDate = event.initialDateScheduled || displayDate || new Date();
  const potentialDays = getNextSevenDays(initialDate);

  // Handle hover - updates the sidebar with available/unavailable users and slot info
  const handleTimeslotHover = (index: number, day: Date, timeIndex: number) => {
    setCurrentAvailableUsers(availableUsers.get(index) || []);
    setCurrentUnavailableUsers(unavailableUsers.get(index) || []);
    if (setCurrentHoveredSlot) {
      const startHour = 10 + timeIndex;
      const endHour = 11 + timeIndex;
      setCurrentHoveredSlot({ day, startHour, endHour });
    }
  };

  // Boolean check to see if all required users can attend at the time.
  const allRequiredUsersAvailable = (index: number) => {
    const currUnavailableUsers: User[] = unavailableUsers.get(index) ?? [];
    for (const user of currUnavailableUsers) {
      if (event && event.requiredMembers.some((m) => m.userId === user.userId)) {
        return false; // there is a required member unavailable
      }
    }
    return true;
  };

  // Handle mouse leave - clears the hover state and shows selected slot's users if any
  const handleMouseLeave = () => {
    if (setCurrentHoveredSlot) {
      setCurrentHoveredSlot(null);
    }
    // If there's a selected slot, show its users
    if (selectedTimeslot !== null) {
      setCurrentAvailableUsers(availableUsers.get(selectedTimeslot) || []);
      setCurrentUnavailableUsers(unavailableUsers.get(selectedTimeslot) || []);
    }
  };

  // Handle click - selects/deselects the time slot
  const handleTimeslotClick = (index: number, day: Date, timeIndex: number) => {
    if (selectedTimeslot === index) {
      // Deselect
      setSelectedTimeslot(null);
      if (onSlotScheduleClick) {
        onSlotScheduleClick(null, 0, 0); // Clear selection in parent
      }
    } else {
      // Select
      setSelectedTimeslot(index);
      if (onSlotScheduleClick) {
        const startHour = 10 + timeIndex;
        const endHour = 11 + timeIndex;
        onSlotScheduleClick(day, startHour, endHour);
      }
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
        overflowY: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseLeave={handleMouseLeave}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          height: '100%',
          tableLayout: 'fixed',
          '& .MuiTableCell-head': {
            bgcolor: 'background.paper',
            px: 0.5,
            py: 0.5
          },
          '& .MuiTableCell-body': {
            px: 0,
            py: 0,
            height: `calc((100% - 40px) / 12)` // 12 time slots, minus header height
          },
          minWidth: 400
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
                  <TableCell
                    key={index}
                    sx={{
                      p: 0
                    }}
                  >
                    <EventTimeSlot
                      backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                      selected={selectedTimeslot === index}
                      allRequiredAvailable={allRequiredUsersAvailable(index)}
                      onClick={() => handleTimeslotClick(index, day, timeIndex)}
                      onMouseEnter={() => handleTimeslotHover(index, day, timeIndex)}
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
