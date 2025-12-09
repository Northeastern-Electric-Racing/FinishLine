/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Box, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import TableCellHuge from './YourEventsComponents/TableCellHuge';
import { useFilterEvents } from '../../hooks/calendar.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect, useState } from 'react';
import { ConflictStatus, ScheduleSlot } from 'shared';
import { Event } from 'shared';

interface YourEventsHeadCells {
  id: string;
  label: string;
}

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
  {
    id: 'approvalBy',
    label: 'Approval By'
  },
  {
    id: 'approvalStatus',
    label: 'Approval Status'
  }
];

const earliestSchedules = new Map<string, ScheduleSlot & { startTime: Date }>();

const getEarliestSchedule = (event: Event) => {
  if (earliestSchedules.has(event.eventId)) {
    return earliestSchedules.get(event.eventId)!;
  }

  const [result] = event.scheduledTimes
    .filter((schedule): schedule is ScheduleSlot & { startTime: Date } => schedule.startTime !== undefined)
    .sort((a, b) => a.startTime.getUTCSeconds() - b.startTime.getUTCSeconds());

  earliestSchedules.set(event.eventId, result);
  return result;
};

const YourEventsPage = () => {
  const user = useCurrentUser();

  const {
    data: events,
    isLoading: eventsLoading,
    isFetching: eventsFetching
  } = useFilterEvents({
    memberIds: [user.userId],
    startPeriod: new Date(0),
    endPeriod: new Date(2099, 11, 31) // Adjust as needed
  });

  const loading = () => eventsLoading || eventsFetching;

  const [, setUpdate] = useState(true); // Linting...

  useEffect(() => {
    const timer = setInterval(() => {
      setUpdate((prev) => !prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
      <PageTitle title="Your Events" />
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
            </TableRow>
          </TableHead>
          <TableBody>
            {loading() ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : events?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              events?.map((event) => {
                const earliestSchedule = getEarliestSchedule(event);
                const now = new Date();
                const diffMs = earliestSchedule.startTime.getTime() - now.getTime();

                const seconds = Math.floor(diffMs / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                // Rough month estimate (30 days)
                const months = Math.floor(days / 30);

                const timeAway = {
                  passed: diffMs <= 0,
                  months,
                  days: days % 30,
                  hours: hours % 24,
                  minutes: minutes % 60,
                  seconds: seconds % 60
                };

                return (
                  <TableRow key={event.eventId} hover>
                    <TableCell align="center">{event.title}</TableCell>
                    <TableCell align="center">
                      {new Date(earliestSchedule.startTime).toLocaleDateString()}{' '}
                      {!timeAway.passed ? ` - In ${timeAway.months}m : ${timeAway.days}d` : '- Passed'}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(earliestSchedule.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}{' '}
                      {!timeAway.passed ? ` - In ${timeAway.hours}h ${timeAway.minutes}m ${timeAway.seconds}s` : '- Passed'}
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
                    <TableCell align="center">
                      {event.approvalRequiredFrom
                        ? `${event.approvalRequiredFrom.firstName} ${event.approvalRequiredFrom.lastName}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      {event.approved === ConflictStatus.CONFIRMED
                        ? 'Approved'
                        : event.approved === ConflictStatus.UNCONFIRMED
                          ? 'PENDING'
                          : event.approved === ConflictStatus.DENIED
                            ? 'DENIED'
                            : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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
    </Box>
  );
};

export default YourEventsPage;
