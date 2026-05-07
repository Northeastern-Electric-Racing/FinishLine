import ical, { ICalEventStatus } from 'ical-generator';
import { Event, wbsPipe } from 'shared';

export const generateIcsFeed = (events: Event[]): string => {
  const cal = ical({ name: 'Northeastern Electric Racing' });

  for (const event of events) {
    for (const slot of event.scheduledTimes) {
      const descriptionParts: string[] = [];
      if (event.description) descriptionParts.push(event.description);

      const memberName = (m: { firstName: string; lastName: string }) => `${m.firstName} ${m.lastName}`;
      if (event.requiredMembers.length > 0)
        descriptionParts.push(`Required: ${event.requiredMembers.map(memberName).join(', ')}`);
      if (event.optionalMembers.length > 0)
        descriptionParts.push(`Optional: ${event.optionalMembers.map(memberName).join(', ')}`);

      if (event.zoomLink) descriptionParts.push(`Zoom: ${event.zoomLink}`);
      if (event.teams.length > 0) descriptionParts.push(`Teams: ${event.teams.map((team) => team.teamName).join(', ')}`);
      if (event.shops.length > 0) descriptionParts.push(`Shops: ${event.shops.map((shop) => shop.name).join(', ')}`);
      if (event.machinery.length > 0)
        descriptionParts.push(`Machinery: ${event.machinery.map((machine) => machine.name).join(', ')}`);
      if (event.workPackages.length > 0)
        descriptionParts.push(
          `Work Package: ${event.workPackages.map((wp) => `${wp.wbsElement.name} (${wbsPipe(wp.wbsElement)})`).join(', ')}`
        );

      cal.createEvent({
        id: `${event.eventId}-${slot.scheduleSlotId}@finishlinebyner.com`,
        summary: event.title,
        start: slot.startTime,
        end: slot.endTime,
        allDay: slot.allDay,
        description: descriptionParts.length > 0 ? descriptionParts.join('\n\n') : undefined,
        location: event.location ?? event.zoomLink ?? undefined,
        status: ICalEventStatus.CONFIRMED,
        organizer: { name: event.userCreated.firstName + ' ' + event.userCreated.lastName, email: event.userCreated.email }
      });
    }
  }

  return cal.toString();
};
