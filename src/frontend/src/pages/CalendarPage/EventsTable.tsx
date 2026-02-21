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
import { Calendar, ConflictStatus, EventType } from 'shared';
import { Event } from 'shared';
import WarningTooltip from './YourEventsComponents/WarningTooltip';
import { getMeetingDates } from '../../utils/calendar.utils';
import { EventClickPopup } from './EventClickPopup';
import { useDeleteEvent } from '../../hooks/calendar.hooks';
import EditEventModal from './Components/EditEventModal';
import { useToast } from '../../hooks/toasts.hooks';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NERDeleteModal from '../../components/NERDeleteModal';

interface YourEventsHeadCells {
  id: string;
  label: string;
}

const getNextMeetingTime = (event: Event): Date => {
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

const isAllDayEvent = (event: Event): boolean => {
  return event.scheduledTimes.length > 0 && event.scheduledTimes[0]?.allDay === true;
};

const isUnscheduledEvent = (event: Event): boolean => {
  return event.scheduledTimes.length === 0;
};

const sortEvents = (events: Event[]): Event[] => {
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

export interface EventTableArgs {
  yourEvents: Event[];
  reviewEvents: Event[];
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

const EventsTable: React.FC<EventTableArgs> = ({ tab, yourEvents, reviewEvents, allEventTypes, allCalendars }) => {
  // Convert to include proper dates
  // Done this way to allow the old events transformer to function properly
  // but provide better utility to this file (without breaking other files that may rely on eventTransformer)

  const toast = useToast();

  const [clickedEvent, setClickedEvent] = useState<Event>();
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number }>();

  const [clickedEditEvent, setClickedEditEvent] = useState<Event | undefined>();
  const [showEditModal, setShowEditModal] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<Event | undefined>(undefined);

  const handleOpenClickPopup = (event: Event) => {
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

  const handleEdit = (event: Event) => {
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

  const events = sortEvents(tab === 1 ? yourEvents : reviewEvents);

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
              {headCells.map((headCell) => (
                <TableCellHuge title={headCell.label} />
              ))}
              {tab === 1 && <TableCellHuge title={''} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {events?.map((event) => {
              const earliestSchedule = new Date(getNextMeetingTime(event));

              const attendeeNumber =
                event.requiredMembers.length + event.optionalMembers.length - event.deniedMembers.length + 1;

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
        clickedEvent={
          clickedEvent
            ? {
                ...clickedEvent,
                startTime: getNextMeetingTime(clickedEvent as Event),
                endTime: getNextMeetingTime(clickedEvent as Event),
                allDay: clickedEvent?.scheduledTimes[0]?.allDay ?? false,
                scheduleSlotId: clickedEvent?.scheduledTimes[0]?.scheduleSlotId ?? '',
                recurring: clickedEvent.scheduledTimes.length > 1,
                totalScheduledSlots: clickedEvent.scheduledTimes.length
              }
            : undefined
        }
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
          event={{
            ...clickedEditEvent,
            startTime: getNextMeetingTime(clickedEditEvent as Event),
            endTime: getNextMeetingTime(clickedEditEvent as Event),
            allDay: clickedEditEvent?.scheduledTimes[0]?.allDay ?? false,
            scheduleSlotId: clickedEditEvent?.scheduledTimes[0]?.scheduleSlotId ?? '',
            recurring: clickedEditEvent.scheduledTimes.length > 1,
            totalScheduledSlots: clickedEditEvent.scheduledTimes.length
          }}
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
