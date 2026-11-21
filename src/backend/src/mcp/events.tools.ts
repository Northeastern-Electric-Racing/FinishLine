import * as z from 'zod/v4';
import CalendarService from '../services/calendar.services.js';
import { HttpException } from '../utils/errors.utils.js';
import { withToolErrors } from './errors.js';
import { isoDateSchema, offsetSchema, registerReadOnlyTool, ToolRegistrar } from './tools.utils.js';

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
        'numScheduledSlots means it also repeats outside the range. Results come back a page at a time, ' +
        'and nextOffset is present only while more remain. Keep the range as narrow as the question ' +
        'allows.',
      inputSchema: z.object({
        startDate: isoDateSchema('Start of the range, as an ISO date such as "2026-09-01".'),
        endDate: isoDateSchema(
          'Last day of the range, as an ISO date. Events on this day are included. Must be on or after startDate.'
        ),
        offset: offsetSchema('events')
      })
    },
    async ({ startDate, endDate, offset = 0 }) =>
      withToolErrors('', async () => {
        if (endDate < startDate) throw new HttpException(400, 'endDate must be on or after startDate');

        // the period is inclusive of the whole last day, so an endDate of 2026-09-07 covers events on the 7th
        const filters = { startPeriod: new Date(startDate), endPeriod: new Date(`${endDate}T23:59:59.999Z`) };

        return CalendarService.getCalendarViewEventsPage(filters, offset, organization);
      })
  );
};
