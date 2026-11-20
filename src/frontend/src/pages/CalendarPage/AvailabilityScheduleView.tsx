import { ButtonBase, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Availability, EventDetail, dbDateToLocalDate, getDayOfWeek, getNextSevenDays, User } from 'shared';
import React, { useState } from 'react';
import {
  enumToArray,
  getBackgroundColor,
  NUMBER_OF_TIME_SLOTS,
  REVIEW_TIMES,
  reviewTimesInCurrentTimeZone
} from '../../utils/design-review.utils';
import { datePipe } from '../../utils/pipes';
import EventTimeSlot, { timeSlotCellSx } from './Components/EventTimeSlot';

interface AvailabilityScheduleViewProps {
  availableUsers: Map<number, User[]>;
  unavailableUsers: Map<number, User[]>;
  usersToAvailabilities: Map<User, Availability[]>;
  setCurrentAvailableUsers: (val: User[]) => void;
  setCurrentUnavailableUsers: (val: User[]) => void;
  setCurrentHoveredSlot?: (slot: { day: Date; startHour: number; endHour: number } | null) => void;
  event: Pick<EventDetail, 'initialDateScheduled' | 'requiredMembers'>;
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
  const [selectedTimeslots, setSelectedTimeslots] = useState<Set<number>>(new Set());

  // Use displayDate if provided, otherwise fall back to event's initial date.
  const initialDate = event.initialDateScheduled ? dbDateToLocalDate(event.initialDateScheduled) : displayDate || new Date();
  const potentialDays = getNextSevenDays(initialDate);
  const timesPerDay = enumToArray(REVIEW_TIMES).length;

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
    // If there's a single selected slot, show its users
    if (selectedTimeslots.size === 1) {
      const [index] = [...selectedTimeslots];
      setCurrentAvailableUsers(availableUsers.get(index) || []);
      setCurrentUnavailableUsers(unavailableUsers.get(index) || []);
    }
  };

  // The parent schedules one continuous block, so the selection is only passed up when it is
  // a contiguous range of slots on a single day otherwise the parent's selection is cleared
  const reportSelectionToParent = (slots: Set<number>) => {
    if (!onSlotScheduleClick) return;
    if (slots.size === 0) {
      onSlotScheduleClick(null, 0, 0);
      return;
    }
    const sortedSlots = [...slots].sort((a, b) => a - b);
    const [firstSlot] = sortedSlots;
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    const dayIndex = Math.floor(firstSlot / timesPerDay);
    const isContiguousSingleDay =
      Math.floor(lastSlot / timesPerDay) === dayIndex && lastSlot - firstSlot === sortedSlots.length - 1;

    if (!isContiguousSingleDay) {
      onSlotScheduleClick(null, 0, 0);
      return;
    }
    onSlotScheduleClick(potentialDays[dayIndex], 10 + (firstSlot % timesPerDay), 11 + (lastSlot % timesPerDay));
  };

  // Deselects the given slots if they are all already selected, otherwise selects all of them
  const toggleSlots = (indices: number[]) => {
    const allSelected = indices.every((index) => selectedTimeslots.has(index));
    const nextSelected = new Set(selectedTimeslots);
    indices.forEach((index) => {
      if (allSelected) {
        nextSelected.delete(index);
      } else {
        nextSelected.add(index);
      }
    });
    setSelectedTimeslots(nextSelected);
    reportSelectionToParent(nextSelected);
  };

  const handleColumnClick = (dayIndex: number) => {
    toggleSlots(Array.from({ length: timesPerDay }, (_, timeIndex) => dayIndex * timesPerDay + timeIndex));
  };

  const handleRowClick = (timeIndex: number) => {
    toggleSlots(potentialDays.map((_, dayIndex) => dayIndex * timesPerDay + timeIndex));
  };

  // Handle click - selects/deselects the time slot
  const handleTimeslotClick = (index: number) => {
    toggleSlots([index]);
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
            {potentialDays.map((day, dayIndex) => (
              <TableCell key={dayIndex}>
                <ButtonBase onClick={() => handleColumnClick(dayIndex)} sx={{ width: '100%', borderRadius: 1 }}>
                  <Typography flexGrow={1} variant="h6" align="center" sx={{ fontSize: { xs: 12, md: 16 } }}>
                    {getDayOfWeek(day) + ' ' + datePipe(day)}
                  </Typography>
                </ButtonBase>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {enumToArray(REVIEW_TIMES).map((time, timeIndex) => (
            <TableRow key={timeIndex}>
              <TableCell sx={{ ...stickyLeft, zIndex: 1 }}>
                <ButtonBase onClick={() => handleRowClick(timeIndex)} sx={{ width: '100%', borderRadius: 1 }}>
                  <Typography flexGrow={1} variant="h6" align="center" sx={{ fontSize: { xs: 12, md: 16 } }}>
                    {reviewTimesInCurrentTimeZone(time)}
                  </Typography>
                </ButtonBase>
              </TableCell>
              {potentialDays.map((day, dayIndex) => {
                const index = dayIndex * timesPerDay + timeIndex;
                return (
                  <TableCell key={index} sx={timeSlotCellSx}>
                    <EventTimeSlot
                      backgroundColor={getBackgroundColor(availableUsers.get(index)?.length, totalUsers)}
                      selected={selectedTimeslots.has(index)}
                      allRequiredAvailable={allRequiredUsersAvailable(index)}
                      onClick={() => handleTimeslotClick(index)}
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
