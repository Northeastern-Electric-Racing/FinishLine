import { Prisma } from '@prisma/client';
import { McpEvent } from 'shared';
import { McpEventQueryArgs } from '../../prisma-query-args/mcp/events.query-args.js';
import { eventUrl } from '../../utils/urls.utils.js';

export const mcpEventTransformer = (event: Prisma.EventGetPayload<McpEventQueryArgs>): McpEvent => {
  return {
    eventId: event.eventId,
    title: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    zoomLink: event.zoomLink ?? undefined,
    status: event.status,
    eventType: event.eventType.name,
    calendars: event.eventType.calendars.map((calendar) => calendar.name),
    times: event.scheduledTimes.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      allDay: slot.allDay
    })),
    // based on the unfiltered slot count, so an event that recurs outside the requested range is
    // still reported as recurring
    recurring: event._count.scheduledTimes > 1,
    teams: event.teams.map((team) => team.teamName),
    viewOnFinishline: eventUrl(event.eventId)
  };
};
