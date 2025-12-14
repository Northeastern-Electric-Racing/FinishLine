/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Box, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import TableCellHuge from './YourEventsComponents/TableCellHuge';
import React, { useEffect, useState } from 'react';
import { ConflictStatus, ScheduleSlot } from 'shared';
import { Event } from 'shared';
import WarningTooltip from './YourEventsComponents/WarningTooltip';

interface YourEventsHeadCells {
  id: string;
  label: string;
}

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

export interface EventTableArgs {
  yourEvents: Event[];
  reviewEvents: Event[];
  tab: number;
}

const YourEventsPage: React.FC<EventTableArgs> = ({ tab, yourEvents, reviewEvents }) => {
  // Convert to include proper dates
  // Done this way to allow the old events transformer to function properly
  // but provide better utility to this file (without breaking other files that may rely on eventTransformer)

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
            {events?.map((event) => {
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

              const attendeeNumber =
                event.requiredMembers.length + event.optionalMembers.length - event.deniedMembers.length + 1;

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
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
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
                          <WarningTooltip
                            warning="Your meeting approval has been denied, please reschedule or change your meeting location."
                            buttonText="Click Here to Edit Meeting"
                            onClick={() => {}}
                          />
                        )}
                      </Box>
                    </TableCell>
                  )}
                  {tab === 2 && (
                    <TableCell align="center">
                      {event.approved === ConflictStatus.PENDING
                        ? '...'
                        : event.approved === ConflictStatus.APPROVED
                          ? 'Yes'
                          : 'No'}
                      {event.approved === ConflictStatus.PENDING && (
                        <WarningTooltip
                          warning="This meeting is awaiting your approval. Please review the booking."
                          buttonText="View More Meeting Details"
                          onClick={() => {}}
                        />
                      )}
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
    </Box>
  );
};

export default YourEventsPage;
