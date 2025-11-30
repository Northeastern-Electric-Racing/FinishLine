import { Grid } from '@mui/material';
import { Availability, Event, EventStatus, getMostRecentAvailabilities, User, UserWithScheduleSettings } from 'shared';
import { useState } from 'react';
import AvailabilityScheduleView from './AvailabilityScheduleView';
import UserAvailabilites from './UserAvailabilitesView';
import { getWeekDateRange } from '../../../utils/design-review.utils';
import { dateRangePipe } from '../../../utils/pipes';
import { FinalizeEventInformation } from './EventDetailPage';
import { useManyUsersWithScheduleSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface AvailabilityViewProps {
  event: Event;
  allEvents: Event[];
  handleEdit: (data?: FinalizeEventInformation) => void;
  selectedDate: Date;
  setSelectDate: (date: Date) => void;
  startTime: number;
  endTime: number;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  requiredUserIds: string[];
  optionalUserIds: string[];
}

const AvailabilityView: React.FC<AvailabilityViewProps> = ({
  event,
  allEvents,
  handleEdit,
  selectedDate,
  setSelectDate,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  requiredUserIds,
  optionalUserIds
}) => {
  const {
    data: relevantUsers,
    isLoading,
    isError,
    error
  } = useManyUsersWithScheduleSettings([...requiredUserIds, ...optionalUserIds]);

  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const existingMeetingData = new Map<number, string>();
  const usersToAvailabilities = new Map<User, Availability[]>();

  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);
  const [startDateRange, endDateRange] = getWeekDateRange(selectedDate);

  if (isLoading || !relevantUsers) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  // Get events within the current week
  const currentWeekEvents = allEvents.filter((currEvent) => {
    const eventDate = currEvent.scheduledTimes[0]?.initialDateScheduled;
    if (!eventDate) return false;

    const drDate = new Date(eventDate).getTime();
    const startRange = startDateRange.getTime();
    const endRange = endDateRange.getTime();

    return drDate >= startRange && drDate <= endRange;
  });

  const onSelectedTimeslotChanged = (index: number | null, day: Date | null) => {
    if (index === null || day === null) return;
    setStartTime(index);
    setEndTime(index + 1);
    setSelectDate(day);
  };

  // Find conflicting events for the selected time
  const conflictingEvents = allEvents.filter((currEvent) => {
    if (currEvent.eventId === event.eventId) return false;
    if (currEvent.status !== EventStatus.SCHEDULED) return false;

    const eventDate = currEvent.scheduledTimes[0]?.initialDateScheduled;
    if (!eventDate) return false;

    const cleanDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * -60000);

    // Check if event is on the selected date
    if (cleanDate.toLocaleDateString() !== selectedDate.toLocaleDateString()) return false;

    // Check if any scheduled times overlap with selected time range
    return currEvent.scheduledTimes.some((slot) => {
      if (!slot.startTime) return false;
      const slotHour = new Date(slot.startTime).getHours();
      return slotHour >= startTime + 10 && slotHour < endTime + 10;
    });
  });

  // Map existing scheduled events to time slots for visualization
  currentWeekEvents.forEach((ev) => {
    if (ev.status === EventStatus.SCHEDULED && ev.eventId !== event.eventId) {
      ev.scheduledTimes.forEach((slot) => {
        if (slot.startTime) {
          const hour = new Date(slot.startTime).getHours();
          const timeIndex = hour - 10; // Convert back to 0-11 index
          if (timeIndex >= 0 && timeIndex < 12) {
            existingMeetingData.set(timeIndex, ev.teamType?.name || 'default');
          }
        }
      });
    }
  });

  // Get the initial date for availability lookup
  const initialDate = event.scheduledTimes[0]?.initialDateScheduled || new Date();

  relevantUsers.forEach((user: UserWithScheduleSettings) => {
    const availability = getMostRecentAvailabilities(user.scheduleSettings?.availabilities ?? [], initialDate);

    usersToAvailabilities.set(user, availability ?? []);
  });

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
          dateRangeTitle={dateRangePipe(startDateRange, endDateRange)}
          onSelectedTimeslotChanged={onSelectedTimeslotChanged}
          event={event}
        />
      </Grid>
      <Grid item xs={3}>
        <UserAvailabilites
          currentAvailableUsers={currentAvailableUsers}
          currentUnavailableUsers={currentUnavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
          event={event}
          conflictingEvents={conflictingEvents}
          handleEdit={handleEdit}
          selectedDate={selectedDate}
          startTime={startTime}
        />
      </Grid>
    </Grid>
  );
};

export default AvailabilityView;
