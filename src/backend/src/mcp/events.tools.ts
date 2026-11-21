import * as z from 'zod/v4';
import { ConflictStatus } from 'shared';
import CalendarService from '../services/calendar.services.js';
import { HttpException } from '../utils/errors.utils.js';
import { withToolErrors } from './errors.js';
import { dateSchema, registerReadOnlyTool, ToolRegistrar } from './tools.utils.js';

export const registerEventTools: ToolRegistrar = (server, { organization }) => {
  registerReadOnlyTool(
    server,
    'finishline_get_events',
    {
      title: 'Get calendar events',
      description:
        'List the calendar events scheduled between startPeriod and endPeriod, across every calendar in ' +
        'the organization. Each event reports its title, status, approval, location, and ' +
        'scheduled times. A recurring event is returned once: scheduledTimes holds only the occurrences ' +
        'inside the period, and numScheduledSlots is how many it has in total, so a larger ' +
        'numScheduledSlots means it also repeats outside the period. Keep the period as narrow as the ' +
        'question allows, since every matching event comes back in one response.',
      inputSchema: z.object({
        startPeriod: dateSchema('Start of the period, such as "2026-09-01T00:00:00Z".'),
        endPeriod: dateSchema(
          'End of the period, such as "2026-09-07T23:59:59Z". A bare date means midnight at the start of ' +
            'that day, so pass an end-of-day time to include events on the last day. Must be after startPeriod.'
        ),
        statuses: z
          .array(z.enum(ConflictStatus))
          .optional()
          .describe(
            'Only events with these approval statuses. In general use APPROVED and NO_CONFLICT to get confirmed events.'
          )
      })
    },
    async ({ startPeriod, endPeriod, statuses }) =>
      withToolErrors('', async () => {
        const start = new Date(startPeriod);
        const end = new Date(endPeriod);
        if (end < start) throw new HttpException(400, 'endPeriod must be after startPeriod');

        return CalendarService.getCalendarViewEvents({ statuses, startPeriod: start, endPeriod: end }, organization);
      })
  );
};
