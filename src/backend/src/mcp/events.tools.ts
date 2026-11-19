import * as z from 'zod/v4';
import CalendarService from '../services/calendar.services.js';
import { parseEventRange } from '../utils/agent.utils.js';
import { withToolErrors } from './errors.js';
import { isoDateSchema, registerReadOnlyTool, ToolRegistrar } from './tools.utils.js';

export const registerEventTools: ToolRegistrar = (server, { organization }) => {
  registerReadOnlyTool(
    server,
    'finishline_get_events',
    {
      title: 'Get calendar events',
      description:
        'List the calendar events scheduled in a date range, across every calendar in the ' +
        'organization. Each event reports its title, status, approval, location, and scheduled times. ' +
        'A recurring event is returned once: scheduledTimes holds only the occurrences inside the ' +
        'requested range, and numScheduledSlots is how many it has in total, so a larger ' +
        'numScheduledSlots means it also repeats outside the range. The range cannot be wider than 7 ' +
        'days; ask for one week at a time.',
      inputSchema: z.object({
        startDate: isoDateSchema('Start of the range, as an ISO date such as "2026-09-01".'),
        endDate: isoDateSchema(
          'End of the range, as an ISO date. Must be on or after startDate and no more than 7 days later.'
        )
      })
    },
    async ({ startDate, endDate }) =>
      withToolErrors('Split the request into one week at a time.', async () =>
        CalendarService.getCalendarViewEvents(parseEventRange(new Date(startDate), new Date(endDate)), organization)
      )
  );
};
