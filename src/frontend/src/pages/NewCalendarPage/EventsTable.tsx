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
import React, { useEffect, useState } from 'react';
import { Calendar, ConflictStatus, EventType } from 'shared';
import { Event } from 'shared';
import WarningTooltip from './YourEventsComponents/WarningTooltip';
import { convertEventToFormValues, getMeetingDates } from '../../utils/calendar.utils';
import { EventClickPopup } from './EventClickPopup';
import { EditEventArgs, useDeleteEvent, useEditEvent } from '../../hooks/calendar.hooks';
import EditEventModal from './Components/EditEventModal';
import { EventRoutePayload } from './Components/EventModal';
import { useToast } from '../../hooks/toasts.hooks';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NERDeleteModal from '../../components/NERDeleteModal';

interface YourEventsHeadCells {
  id: string;
  label: string;
}

const getNextMeetingTime = (event: Event) => {
  const times: Date[] = getMeetingDates(event);

  times.sort((a, b) => a.getUTCSeconds() - b.getUTCSeconds());
  let result = times[times.length - 1];
  times.forEach((date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs > 0 && date.getTime() < result.getTime()) {
      result = date;
    }
  });

  return result;
};

export interface EventTableArgs {
  yourEvents: Event[];
  reviewEvents: Event[];
  allEventTypes: EventType[];
  allCalendars: Calendar[];
  tab: number;
  handleEditSubmit: (
    data: EventRoutePayload,
    event: Event,
    editEvent: (editArgs: EditEventArgs) => Promise<Event>,
    onClose: () => void
  ) => Promise<void>;
}

// trigger re-renders specifically for the timer
const CountdownElement = ({ targetDate }: { targetDate: Date }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const diffMs = targetDate.getTime() - now.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const timeAway = {
    passed: diffMs <= 0,
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60
  };

  if (timeAway.passed) {
    return <>- Passed</>;
  }

  return (
    <>
      - In {timeAway.days}d {timeAway.hours}h {timeAway.minutes}m {timeAway.seconds}s
    </>
  );
};

const EventsTable: React.FC<EventTableArgs> = ({
  tab,
  yourEvents,
  reviewEvents,
  allEventTypes,
  allCalendars,
  handleEditSubmit
}) => {
  // Convert to include proper dates
  // Done this way to allow the old events transformer to function properly
  // but provide better utility to this file (without breaking other files that may rely on eventTransformer)

  const toast = useToast();

  const [clickedEvent, setClickedEvent] = useState<Event>();
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number }>();

  const [clickedEditEvent, setClickedEditEvent] = useState<Event | undefined>();
  const [showEditModal, setShowEditModal] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<Event | undefined>(undefined);

  const { mutateAsync: editEvent } = useEditEvent(clickedEditEvent?.eventId ?? '');

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
      id: 'eventsName',
      label: 'Events Name'
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

  const events = tab === 1 ? yourEvents : reviewEvents;

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
                  <TableCell align="center">
                    {new Date(earliestSchedule).toLocaleDateString()} {<CountdownElement targetDate={earliestSchedule} />}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(earliestSchedule).toLocaleTimeString('en-US', {
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
        clickedEvent={clickedEvent}
        anchorPosition={anchorPosition}
        onClose={handleCloseClickPopup}
        eventTypes={allEventTypes}
        calendars={allCalendars}
        disable={true}
        addApprovalButtons={true}
      />
      {clickedEditEvent && showEditModal && (
        <EditEventModal
          open={showEditModal}
          onClose={handleCloseEdit}
          onSubmit={(data) => {
            handleEditSubmit(data, clickedEditEvent, editEvent, () => {
              setShowEditModal(false);
              handleCloseEdit();
            });
          }}
          initialValues={convertEventToFormValues(clickedEditEvent)}
          eventTypes={allEventTypes}
          defaultDate={new Date()}
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
