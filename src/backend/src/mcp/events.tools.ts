import * as z from 'zod/v4';
import { ConflictStatus } from 'shared';
import CalendarService from '../services/calendar.services.js';
import { HttpException } from '../utils/errors.utils.js';
import { withToolErrors } from './errors.js';
import { dateSchema, idListSchema, registerReadOnlyTool, ToolRegistrar } from './tools.utils.js';

export const registerEventTools: ToolRegistrar = (server, { organization }) => {
  registerReadOnlyTool(
    server,
    'finishline_get_events',
    {
      title: 'Get calendar events',
      description:
        'List the calendar events scheduled between startPeriod and endPeriod, the same filters the ' +
        'FinishLine calendar view uses. Each event reports its title, status, approval, location, and ' +
        'scheduled times. A recurring event is returned once: scheduledTimes holds only the occurrences ' +
        'inside the period, and numScheduledSlots is how many it has in total, so a larger ' +
        'numScheduledSlots means it also repeats outside the period. Every filter is optional; filters ' +
        'on members and teams match an event that involves any of them. Keep the period as narrow as the ' +
        'question allows, since every matching event comes back in one response.',
      inputSchema: z.object({
        startPeriod: dateSchema('Start of the period, such as "2026-09-01T00:00:00Z".'),
        endPeriod: dateSchema(
          'End of the period, such as "2026-09-07T23:59:59Z". A bare date means midnight at the start of ' +
            'that day, so pass an end-of-day time to include events on the last day. Must be after startPeriod.'
        ),
        memberIds: idListSchema('Only events these users are required, optional, or the creator of.'),
        teamIds: idListSchema("Only events for these teams, or for work packages in these teams' projects."),
        calendarIds: idListSchema('Only events on these calendars.'),
        eventTypeIds: idListSchema('Only events of these event types.'),
        eventIds: idListSchema('Only these events.'),
        approvalIds: idListSchema('Only events waiting on approval from these users.'),
        statuses: z
          .array(z.enum(ConflictStatus))
          .optional()
          .describe('Only events with these approval statuses. Omit this for every status.')
      })
    },
    async ({ startPeriod, endPeriod, ...filters }) =>
      withToolErrors('', async () => {
        const start = new Date(startPeriod);
        const end = new Date(endPeriod);
        if (end < start) throw new HttpException(400, 'endPeriod must be after startPeriod');

        return CalendarService.getCalendarViewEvents({ ...filters, startPeriod: start, endPeriod: end }, organization);
      })
  );
};
