/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  Box,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import TableCellHuge from './YourEventsComponents/TableCellHuge';
import React, { useState } from 'react';
import { Calendar, CalendarEvent, ConflictStatus, EventType } from 'shared';
import WarningTooltip from './YourEventsComponents/WarningTooltip';
import { EventSlotTarget, getMeetingDates } from '../../utils/calendar.utils';
import { EventClickPopup } from './EventClickPopup';
import { useDeleteEvent, useFilterEvents, useReviewEvents } from '../../hooks/calendar.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import EditEventModal from './Components/EditEventModal';
import { useToast } from '../../hooks/toasts.hooks';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import NERDeleteModal from '../../components/NERDeleteModal';

interface YourEventsHeadCells {
  id: string;
  label: string;
}

const getNextMeetingTime = (event: CalendarEvent): Date => {
  const times: Date[] = getMeetingDates(event);

  // If no scheduled times, fall back to initialDateScheduled (for unscheduled design reviews)
  if (times.length === 0) {
    if (event.initialDateScheduled) {
      return new Date(event.initialDateScheduled);
    }
    // If still no date, return a far future date so it sorts to the end
    return new Date(9999, 11, 31);
  }

  const now = new Date();
  // Find the next upcoming time
  const futureTimes = times.filter((date) => date.getTime() > now.getTime());
  if (futureTimes.length > 0) {
    futureTimes.sort((a, b) => a.getTime() - b.getTime());
    return futureTimes[0];
  }

  // If all times are in the past, return the most recent one
  times.sort((a, b) => b.getTime() - a.getTime());
  return times[0];
};

const isAllDayEvent = (event: CalendarEvent): boolean => {
  return event.scheduledTimes.length > 0 && event.scheduledTimes[0]?.allDay === true;
};

const isUnscheduledEvent = (event: CalendarEvent): boolean => {
  return event.scheduledTimes.length === 0;
};

const sortEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  const now = new Date();

  return [...events].sort((a, b) => {
    const timeA = getNextMeetingTime(a).getTime();
    const timeB = getNextMeetingTime(b).getTime();
    const nowTime = now.getTime();

    const aIsFuture = timeA >= nowTime;
    const bIsFuture = timeB >= nowTime;

    // Future events come first
    if (aIsFuture && !bIsFuture) return -1;
    if (!aIsFuture && bIsFuture) return 1;

    // Both future: soonest first (ascending)
    if (aIsFuture && bIsFuture) {
      return timeA - timeB;
    }

    // Both past: most recent first (descending)
    return timeB - timeA;
  });
};

// the table's slot target for an event: its next (or, with past events shown, earliest returned) slot
const toSlotTarget = (event: CalendarEvent): EventSlotTarget => {
  const nextMeetingTime = getNextMeetingTime(event);
  const slot =
    event.scheduledTimes.find((s) => s.startTime.getTime() === nextMeetingTime.getTime()) ?? event.scheduledTimes[0];
  return {
    eventId: event.eventId,
    title: event.title,
    scheduleSlotId: slot?.scheduleSlotId ?? '',
    startTime: slot?.startTime ?? nextMeetingTime,
    endTime: slot?.endTime ?? nextMeetingTime,
    allDay: slot?.allDay ?? false,
    recurring: event.numScheduledSlots > 1,
    totalScheduledSlots: event.numScheduledSlots
  };
};

// past events are hidden by default, so only events from today on load unless the user asks for all of them
const ALL_TIME_START = new Date(0);
const ALL_TIME_END = new Date(2099, 11, 31);

export interface EventTableArgs {
  allEventTypes: EventType[];
  allCalendars: Calendar[];
  tab: number;
}

const formatEventDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const EventsTable: React.FC<EventTableArgs> = ({ tab, allEventTypes, allCalendars }) => {
  const toast = useToast();
  const user = useCurrentUser();

  const [clickedEvent, setClickedEvent] = useState<CalendarEvent>();
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number }>();

  const [clickedEditEvent, setClickedEditEvent] = useState<CalendarEvent | undefined>();
  const [showEditModal, setShowEditModal] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | undefined>(undefined);
  const [hidePastEvents, setHidePastEvents] = useState(true);
  const [now] = useState(() => new Date());

  // each tab loads only its own events; hiding past events is done by the server
  const yourEventsQuery = useFilterEvents(
    { memberIds: [user.userId], startPeriod: hidePastEvents ? now : ALL_TIME_START, endPeriod: ALL_TIME_END },
    tab === 1
  );
  const reviewEventsQuery = useReviewEvents(hidePastEvents ? now : undefined, tab === 2);
  const { data: baseEvents, isError, error } = tab === 1 ? yourEventsQuery : reviewEventsQuery;

  const handleOpenClickPopup = (event: CalendarEvent) => {
    setClickedEvent(event);
    if (typeof window !== 'undefined') {
      setAnchorPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2
      });
    } else {
      setAnchorPosition({ top: 0, left: 0 });
    }
  };

  const handleCloseClickPopup = () => {
    setClickedEvent(undefined);
    setAnchorPosition(undefined);
  };

  const handleEdit = (event: CalendarEvent) => {
    setClickedEditEvent(event);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setClickedEditEvent(undefined);
    setShowEditModal(false);
  };

  const { mutateAsync: deleteEvent } = useDeleteEvent(eventToDelete?.eventId ?? '');

  const handleEventDelete = async () => {
    if (!eventToDelete) return;
    setEventToDelete(undefined);
    try {
      await deleteEvent();
      toast.success('Event deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      } else {
        toast.error('Failed to delete event', 3000);
      }
    }
  };

  const headCells: readonly YourEventsHeadCells[] = [
    {
      id: 'eventName',
      label: 'Event Name'
    },
    {
      id: 'date',
      label: 'Date'
    },
    {
      id: 'time',
      label: 'Time'
    },
    {
      id: 'location',
      label: 'Location'
    },
    ...(tab === 2
      ? [
          {
            id: 'attendees',
            label: 'Attendees'
          }
        ]
      : []),
    ...(tab === 1
      ? [
          {
            id: 'approvalBy',
            label: 'Approval By'
          }
        ]
      : []),
    ...(tab === 2
      ? [
          {
            id: 'seekingApproval',
            label: 'Seeking Approval'
          }
        ]
      : []),
    ...(tab === 1
      ? [
          {
            id: 'approvalStatus',
            label: 'Approval Status'
          }
        ]
      : []),
    ...(tab === 2
      ? [
          {
            id: 'approveEvent',
            label: 'Approve?'
          }
        ]
      : [])
  ];

  if (isError) return <ErrorPage message={error?.message} />;
  if (!baseEvents) return <LoadingIndicator />;

  const filteredEvents = hidePastEvents
    ? baseEvents.filter((event) => getNextMeetingTime(event).getTime() >= now.getTime())
    : baseEvents;
  const events = sortEvents(filteredEvents);

  return (
    <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
      <PageTitle title={tab === 1 ? 'Your Events' : 'Review Bookings'} />
      <TableContainer
        sx={{
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
          borderRadius: '8px',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 90%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 90%)',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) =>
                headCell.id === 'date' ? (
                  <TableCell key={headCell.id} sx={{ backgroundColor: '#dd514c' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Typography variant="h4" fontSize={25}>
                        {headCell.label}
                      </Typography>
                      <Tooltip
                        title={
                          hidePastEvents ? 'Showing upcoming only; click to show all' : 'Showing all; click to hide past'
                        }
                        arrow
                      >
                        <IconButton size="small" onClick={() => setHidePastEvents((prev) => !prev)} sx={{ color: 'white' }}>
                          {hidePastEvents ? <FilterListIcon fontSize="small" /> : <FilterListOffIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                ) : (
                  <TableCellHuge key={headCell.id} title={headCell.label} />
                )
              )}
              {tab === 1 && <TableCellHuge title={''} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {events?.map((event) => {
              const earliestSchedule = new Date(getNextMeetingTime(event));

              const attendeeNumber = event.numRequiredMembers + event.numOptionalMembers - event.numDeniedMembers + 1;

              return (
                <TableRow key={event.eventId} hover>
                  <TableCell align="center">{event.title}</TableCell>
                  <TableCell align="center">{formatEventDate(earliestSchedule)}</TableCell>
                  <TableCell align="center">
                    {isUnscheduledEvent(event)
                      ? 'TBD'
                      : isAllDayEvent(event)
                        ? 'All Day'
                        : earliestSchedule.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                  </TableCell>
                  <TableCell align="center">
                    {event.location ? (
                      event.location.includes('https://') ? (
                        <Link href={event.location} target="_blank" rel="noopener noreferrer">
                          {event.location}
                        </Link>
                      ) : (
                        event.location
                      )
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  {tab === 2 && <TableCell align="center">{attendeeNumber}</TableCell>}
                  {tab === 1 && (
                    <TableCell align="center">
                      {event.approvalRequiredFrom
                        ? `${event.approvalRequiredFrom.firstName} ${event.approvalRequiredFrom.lastName}`
                        : 'N/A'}
                    </TableCell>
                  )}
                  {tab === 2 && (
                    <TableCell align="center">{`${event.userCreated.firstName} ${event.userCreated.lastName}`}</TableCell>
                  )}
                  {tab === 1 && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <Typography component="span">
                          {event.approved === ConflictStatus.APPROVED
                            ? 'Approved'
                            : event.approved === ConflictStatus.PENDING
                              ? 'Pending'
                              : event.approved === ConflictStatus.DENIED
                                ? 'Denied'
                                : 'N/A'}
                        </Typography>
                        {event.approved === ConflictStatus.DENIED && (
                          <Box sx={{ position: 'absolute', left: '50%', mt: 0.5, ml: 5 }}>
                            <WarningTooltip
                              warning="Your meeting approval has been denied, please reschedule or change your meeting location."
                              buttonText="Click Here to Edit Meeting"
                              onClick={() => handleEdit(event)}
                            />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  )}
                  {tab === 2 && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {event.approved === ConflictStatus.PENDING
                          ? '...'
                          : event.approved === ConflictStatus.APPROVED
                            ? 'Yes'
                            : 'No'}
                        {event.approved === ConflictStatus.PENDING && (
                          <Box sx={{ position: 'absolute', left: '50%', mt: 0.5, ml: 2 }}>
                            <WarningTooltip
                              warning="This meeting is awaiting your approval. Please review the booking."
                              buttonText="View More Meeting Details"
                              onClick={() => {
                                handleOpenClickPopup(event);
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  )}
                  {tab === 1 && (
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="Edit" arrow>
                          <span>
                            <IconButton
                              size="small"
                              aria-label="edit shop"
                              onClick={() => {
                                handleEdit(event);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="delete event"
                              onClick={() => setEventToDelete(event)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            <TableRow
              sx={{
                '& .MuiTableCell-root': {
                  borderBottom: 'none'
                }
              }}
            >
              <TableCell // Padding for the gradient
                sx={{
                  py: 5
                }}
              ></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <EventClickPopup
        clickedEvent={clickedEvent ? toSlotTarget(clickedEvent) : undefined}
        anchorPosition={anchorPosition}
        onClose={handleCloseClickPopup}
        eventTypes={allEventTypes}
        calendars={allCalendars}
        addApprovalButtons={tab === 2 && clickedEvent?.approved === ConflictStatus.PENDING}
      />
      {clickedEditEvent && showEditModal && (
        <EditEventModal
          open={showEditModal}
          onClose={handleCloseEdit}
          event={toSlotTarget(clickedEditEvent)}
          eventTypes={allEventTypes}
        />
      )}
      <NERDeleteModal
        open={!!eventToDelete}
        onHide={() => setEventToDelete(undefined)}
        formId="delete-event-form"
        dataType={eventToDelete?.title || ''}
        onFormSubmit={handleEventDelete}
      />
    </Box>
  );
};

export default EventsTable;
